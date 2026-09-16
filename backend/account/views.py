from rest_framework import status, generics, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.shortcuts import get_object_or_404

from exam.models import Exam, Question, ExamAttempt, Answer
from .permissions import IsTeacher, IsStudent
from .serializers import (
    TeacherRegisterSerializer, StudentRegisterSerializer, CustomTokenObtainPairSerializer
)


# ---------- AUTH ----------

class RegisterTeacherView(APIView):
    def post(self, request):
        serializer = TeacherRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "Teacher registered successfully",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {"id": user.id, "name": user.name, "phone_number": user.phone_number, "role": user.role},
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterStudentView(APIView):
    def post(self, request):
        serializer = StudentRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "Student registered successfully",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id, "name": user.name, "phone_number": user.phone_number,
                    "role": user.role, "roll_no": user.roll_no, "student_class": user.student_class,
                },
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


