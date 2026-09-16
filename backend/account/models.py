import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UserManager(BaseUserManager):
    def create_user(self, phone_number, name, role, password=None, roll_no=None, student_class=None):
        if not phone_number:
            raise ValueError("Phone number is required")
        if not password:
            raise ValueError("Password is required")
        if role not in ('teacher', 'student'):
            raise ValueError("Role must be teacher or student")
        if role == 'student' and not roll_no:
            raise ValueError("Roll number is required for students")

        user = self.model(
            phone_number=phone_number,
            name=name,
            role=role,
            roll_no=roll_no if role == 'student' else None,
            student_class=student_class if role == 'student' else None,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, name, password=None):
        user = self.create_user(phone_number, name, role='teacher', password=password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (('teacher', 'Teacher'), ('student', 'Student'))

    name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15, unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    roll_no = models.CharField(max_length=20, unique=True, null=True, blank=True)
    student_class = models.CharField(max_length=20, null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['name', 'role']

    def __str__(self):
        return f"{self.name} ({self.role})"