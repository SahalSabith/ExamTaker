from rest_framework import status, generics, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import Exam, Question, ExamAttempt, Answer
from account.permissions import IsTeacher, IsStudent
from .serializers import (
    ExamSerializer, ExamListSerializer, ExamStudentSerializer,
    QuestionSerializer, AnswerSubmitSerializer,
    GradeAnswerSerializer, ExamAttemptSerializer
)

# Create your views here.

# ---------- TEACHER: EXAM CRUD ----------

class ExamViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsTeacher]
    serializer_class = ExamSerializer

    def get_queryset(self):
        return Exam.objects.filter(created_by=self.request.user).order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'list':
            return ExamListSerializer
        return ExamSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class PublishExamView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def patch(self, request, exam_id):
        exam = get_object_or_404(Exam, id=exam_id, created_by=request.user)
        if exam.questions.count() == 0:
            return Response({"error": "Add at least one question before publishing."}, status=400)
        exam.is_published = request.data.get('is_published', True)
        exam.save()
        return Response({"message": "Exam updated", "is_published": exam.is_published})


# ---------- TEACHER: QUESTIONS ----------

class QuestionListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get(self, request, exam_id):
        exam = get_object_or_404(Exam, id=exam_id, created_by=request.user)
        serializer = QuestionSerializer(exam.questions.all(), many=True)
        return Response(serializer.data)

    def post(self, request, exam_id):
        exam = get_object_or_404(Exam, id=exam_id, created_by=request.user)
        serializer = QuestionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(exam=exam)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class QuestionDetailView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def get_object(self, question_id, user):
        return get_object_or_404(Question, id=question_id, exam__created_by=user)

    def put(self, request, question_id):
        question = self.get_object(question_id, request.user)
        serializer = QuestionSerializer(question, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, question_id):
        self.get_object(question_id, request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ---------- STUDENT: BROWSE / START EXAM ----------

class AvailableExamsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsStudent]
    serializer_class = ExamListSerializer

    def get_queryset(self):
        return Exam.objects.filter(is_published=True).order_by('-created_at')


class ExamByCodeView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request, access_code):
        exam = get_object_or_404(Exam, access_code=access_code.upper(), is_published=True)
        return Response(ExamListSerializer(exam).data)


class StartExamView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request, exam_id):
        exam = get_object_or_404(Exam, id=exam_id, is_published=True)
        student = request.user

        existing = ExamAttempt.objects.filter(exam=exam, student=student).order_by('-started_at').first()

        if existing and not exam.allow_multiple_attempts:
            if existing.submitted_at:
                return Response({"error": "You have already submitted this exam."}, status=400)
            attempt = existing
        else:
            attempt = ExamAttempt.objects.create(exam=exam, student=student)

        return Response({
            "attempt_id": attempt.id,
            "started_at": attempt.started_at,
            "exam": ExamStudentSerializer(exam).data,
        }, status=status.HTTP_201_CREATED)


class SubmitAnswerView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request, attempt_id):
        attempt = get_object_or_404(ExamAttempt, id=attempt_id, student=request.user)

        if attempt.submitted_at:
            return Response({"error": "Exam already submitted."}, status=400)

        elapsed_minutes = (timezone.now() - attempt.started_at).total_seconds() / 60
        if elapsed_minutes > attempt.exam.duration_minutes:
            return Response({"error": "Time is up for this exam."}, status=400)

        serializer = AnswerSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        question = get_object_or_404(Question, id=data['question_id'], exam=attempt.exam)

        answer, _ = Answer.objects.update_or_create(
            attempt=attempt, question=question,
            defaults={
                'text_answer': data.get('text_answer', ''),
                'selected_choice_id': data.get('selected_choice_id'),
            }
        )

        if question.question_type in ('mcq', 'true_false') and answer.selected_choice:
            answer.marks_obtained = question.marks if answer.selected_choice.is_correct else 0
            answer.save()

        return Response({"message": "Answer saved", "answer_id": answer.id})


class FinishExamView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request, attempt_id):
        attempt = get_object_or_404(ExamAttempt, id=attempt_id, student=request.user)

        if attempt.submitted_at:
            return Response({"error": "Already submitted."}, status=400)

        attempt.submitted_at = timezone.now()
        answers = attempt.answers.all()
        has_ungraded = answers.filter(question__question_type='descriptive', marks_obtained__isnull=True).exists()

        attempt.total_score = sum(a.marks_obtained or 0 for a in answers)
        attempt.is_graded = not has_ungraded
        attempt.save()

        return Response({
            "message": "Exam submitted successfully",
            "total_score": attempt.total_score,
            "fully_graded": attempt.is_graded,
        })


class MyAttemptsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsStudent]
    serializer_class = ExamAttemptSerializer

    def get_queryset(self):
        return ExamAttempt.objects.filter(student=self.request.user).order_by('-started_at')


class AttemptResultView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, attempt_id):
        attempt = get_object_or_404(ExamAttempt, id=attempt_id)
        if request.user != attempt.student and request.user != attempt.exam.created_by:
            return Response({"error": "Not allowed."}, status=403)
        return Response(ExamAttemptSerializer(attempt).data)


# ---------- TEACHER: GRADING ----------

class ExamAttemptsListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsTeacher]
    serializer_class = ExamAttemptSerializer

    def get_queryset(self):
        exam = get_object_or_404(Exam, id=self.kwargs['exam_id'], created_by=self.request.user)
        return exam.attempts.filter(submitted_at__isnull=False).order_by('-submitted_at')


class GradeAnswerView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]

    def patch(self, request, answer_id):
        answer = get_object_or_404(Answer, id=answer_id, question__exam__created_by=request.user)
        serializer = GradeAnswerSerializer(answer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            attempt = answer.attempt
            answers = attempt.answers.all()
            has_ungraded = answers.filter(question__question_type='descriptive', marks_obtained__isnull=True).exists()
            attempt.total_score = sum(a.marks_obtained or 0 for a in answers)
            attempt.is_graded = not has_ungraded
            attempt.save()
            return Response({"message": "Graded successfully", "marks_obtained": answer.marks_obtained})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)