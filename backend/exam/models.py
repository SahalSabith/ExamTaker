import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from account.models import User

class Exam(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exams', limit_choices_to={'role': 'teacher'})
    duration_minutes = models.PositiveIntegerField(help_text="Total exam duration in minutes")
    access_code = models.CharField(max_length=8, unique=True, editable=False)
    is_published = models.BooleanField(default=False)
    results_published = models.BooleanField(default=False)
    start_at = models.DateTimeField(null=True, blank=True)
    end_at = models.DateTimeField(null=True, blank=True)
    allow_multiple_attempts = models.BooleanField(default=False)
    shuffle_questions = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.access_code:
            self.access_code = uuid.uuid4().hex[:8].upper()
        super().save(*args, **kwargs)

    @property
    def total_marks(self):
        return sum(q.marks for q in self.questions.all())

    def __str__(self):
        return self.title


class Question(models.Model):
    QUESTION_TYPES = (
        ('mcq', 'Multiple Choice'),
        ('true_false', 'True / False'),
        ('descriptive', 'Descriptive'),
    )

    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=15, choices=QUESTION_TYPES)
    marks = models.PositiveIntegerField(default=1)
    time_limit_seconds = models.PositiveIntegerField(null=True, blank=True, help_text="Optional per-question timer")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.question_text[:50]} ({self.question_type})"


class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    choice_text = models.CharField(max_length=300)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.choice_text


class ExamAttempt(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='attempts')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attempts', limit_choices_to={'role': 'student'})
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    total_score = models.FloatField(null=True, blank=True)
    is_graded = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.student.name} - {self.exam.title}"


class Answer(models.Model):
    attempt = models.ForeignKey(ExamAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    selected_choice = models.ForeignKey(Choice, on_delete=models.SET_NULL, null=True, blank=True)
    text_answer = models.TextField(blank=True)
    marks_obtained = models.FloatField(null=True, blank=True)

    class Meta:
        unique_together = ('attempt', 'question')
