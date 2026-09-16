import re
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Exam, Question, Choice, ExamAttempt, Answer

# ---------- QUESTIONS ----------

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'choice_text', 'is_correct']


class ChoiceStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'choice_text']  # is_correct hidden


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, required=False)

    class Meta:
        model = Question
        fields = ['id', 'exam', 'question_text', 'question_type', 'marks', 'time_limit_seconds', 'order', 'choices']
        extra_kwargs = {'exam': {'required': False}}

    def validate(self, attrs):
        q_type = attrs.get('question_type', getattr(self.instance, 'question_type', None))
        choices = self.initial_data.get('choices', [])

        if q_type in ('mcq', 'true_false'):
            if len(choices) < 2:
                raise serializers.ValidationError("MCQ / True-False questions need at least 2 choices.")
            correct_count = sum(1 for c in choices if c.get('is_correct'))
            if correct_count != 1:
                raise serializers.ValidationError("Exactly one choice must be marked correct.")
        return attrs

    def create(self, validated_data):
        choices_data = validated_data.pop('choices', [])
        question = Question.objects.create(**validated_data)
        for choice in choices_data:
            Choice.objects.create(question=question, **choice)
        return question

    def update(self, instance, validated_data):
        choices_data = validated_data.pop('choices', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if choices_data is not None:
            instance.choices.all().delete()
            for choice in choices_data:
                Choice.objects.create(question=instance, **choice)
        return instance


class QuestionStudentSerializer(serializers.ModelSerializer):
    choices = ChoiceStudentSerializer(many=True, required=False)

    class Meta:
        model = Question
        fields = ['id', 'question_text', 'question_type', 'marks', 'time_limit_seconds', 'order', 'choices']


# ---------- EXAM ----------

class ExamSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    total_marks = serializers.ReadOnlyField()
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)

    class Meta:
        model = Exam
        fields = ['id', 'title', 'description', 'duration_minutes', 'access_code',
                  'is_published', 'allow_multiple_attempts', 'shuffle_questions',
                  'created_by', 'created_by_name', 'total_marks', 'questions', 'created_at']
        read_only_fields = ['created_by', 'access_code']


class ExamListSerializer(serializers.ModelSerializer):
    total_marks = serializers.ReadOnlyField()
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = Exam
        fields = ['id', 'title', 'description', 'duration_minutes', 'access_code',
                  'is_published', 'total_marks', 'question_count', 'created_at']

    def get_question_count(self, obj):
        return obj.questions.count()


class ExamStudentSerializer(serializers.ModelSerializer):
    questions = QuestionStudentSerializer(many=True, read_only=True)
    total_marks = serializers.ReadOnlyField()

    class Meta:
        model = Exam
        fields = ['id', 'title', 'description', 'duration_minutes', 'total_marks', 'questions']


# ---------- ATTEMPT / ANSWERS ----------

class AnswerSubmitSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    selected_choice_id = serializers.IntegerField(required=False, allow_null=True)
    text_answer = serializers.CharField(required=False, allow_blank=True)


class AnswerResultSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    question_type = serializers.CharField(source='question.question_type', read_only=True)
    max_marks = serializers.IntegerField(source='question.marks', read_only=True)
    selected_choice_text = serializers.CharField(source='selected_choice.choice_text', read_only=True)

    class Meta:
        model = Answer
        fields = ['id', 'question', 'question_text', 'question_type', 'max_marks',
                  'selected_choice', 'selected_choice_text', 'text_answer', 'marks_obtained']


class GradeAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'marks_obtained']

    def validate_marks_obtained(self, value):
        max_marks = self.instance.question.marks
        if value < 0 or value > max_marks:
            raise serializers.ValidationError(f"Marks must be between 0 and {max_marks}.")
        return value


class ExamAttemptSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    roll_no = serializers.CharField(source='student.roll_no', read_only=True)
    exam_title = serializers.CharField(source='exam.title', read_only=True)
    answers = AnswerResultSerializer(many=True, read_only=True)

    class Meta:
        model = ExamAttempt
        fields = ['id', 'exam', 'exam_title', 'student', 'student_name', 'roll_no',
                  'started_at', 'submitted_at', 'total_score', 'is_graded', 'answers']