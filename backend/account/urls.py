from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterTeacherView, RegisterStudentView, LoginView,
)

from exam.views import (
    ExamViewSet, PublishExamView,
    QuestionListCreateView, QuestionDetailView,
    AvailableExamsView, ExamByCodeView, StartExamView,
    SubmitAnswerView, FinishExamView, MyAttemptsView, AttemptResultView,
    ExamAttemptsListView, GradeAnswerView,
)

exam_list = ExamViewSet.as_view({'get': 'list', 'post': 'create'})
exam_detail = ExamViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'})

urlpatterns = [
    path('auth/register/teacher/', RegisterTeacherView.as_view()),
    path('auth/register/student/', RegisterStudentView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path('auth/token/refresh/', TokenRefreshView.as_view()),

    path('teacher/exams/', exam_list),
    path('teacher/exams/<int:pk>/', exam_detail),
    path('teacher/exams/<int:exam_id>/publish/', PublishExamView.as_view()),
    path('teacher/exams/<int:exam_id>/questions/', QuestionListCreateView.as_view()),
    path('teacher/questions/<int:question_id>/', QuestionDetailView.as_view()),
    path('teacher/exams/<int:exam_id>/attempts/', ExamAttemptsListView.as_view()),
    path('teacher/answers/<int:answer_id>/grade/', GradeAnswerView.as_view()),

    path('student/exams/', AvailableExamsView.as_view()),
    path('student/exams/code/<str:access_code>/', ExamByCodeView.as_view()),
    path('student/exams/<int:exam_id>/start/', StartExamView.as_view()),
    path('student/attempts/<int:attempt_id>/answer/', SubmitAnswerView.as_view()),
    path('student/attempts/<int:attempt_id>/finish/', FinishExamView.as_view()),
    path('student/attempts/', MyAttemptsView.as_view()),

    path('attempts/<int:attempt_id>/result/', AttemptResultView.as_view()),
]