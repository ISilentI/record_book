from typing import Union

from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status

from app.config import config
from app.database import get_session
from app.fixtures import TEACHER_CREATE_EXAMPLE, STUDENT_CREATE_EXAMPLE
from app.models import StudentCreate, TeacherCreate, Token, UserAuth
from app.services import AuthService

router = APIRouter(prefix=config.BACKEND_PREFIX)


@router.post(
    "/signin",
    response_model=Token,
    response_description="Успешный возврат токена авторизации",
    status_code=status.HTTP_200_OK,
    description="Войти в сервис и получить токен",
    summary="Вход в сервис",
    # responses={},
)
async def signin(
    model: UserAuth,
    db: AsyncSession = Depends(get_session),
    auth_service: AuthService = Depends(),
):
    return await auth_service.signin(db=db, model=model)


@router.post(
    "/signup",
    response_model=Token,
    response_description="Успешный возврат токена авторизации",
    status_code=status.HTTP_200_OK,
    description="Зарегистирироваться в сервисе и получить токен",
    summary="Регистрация в сервисе",
    # responses={},
)
async def signup(
    model: Union[TeacherCreate, StudentCreate] = Body(
            None,
            examples={
                "student": {
                    "summary": "Пример регистрации студента",
                    "value": STUDENT_CREATE_EXAMPLE,
                },
                "teacher": {
                    "summary": "Пример регистрации преподавателя",
                    "value": TEACHER_CREATE_EXAMPLE,
                }
            },
    ),
    db: AsyncSession = Depends(get_session),
    auth_service: AuthService = Depends(),
):
    return await auth_service.signup(db=db, model=model)
