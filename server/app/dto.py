from dataclasses import dataclass, field


def _omit_none(d):
    return {k: v for k, v in d.items() if v is not None}


@dataclass
class AnswerOptionDTO:
    id: int
    text: str
    is_correct: bool | None = None

    @classmethod
    def from_model(cls, model, include_correct=False):
        return cls(
            id=model.id,
            text=model.text,
            is_correct=model.is_correct if include_correct else None,
        )

    def to_dict(self):
        return _omit_none(
            {
                "id": self.id,
                "text": self.text,
                "isCorrect": self.is_correct,
            }
        )


@dataclass
class QuestionDTO:
    id: int
    text: str
    points: int
    answers: list[AnswerOptionDTO] = field(default_factory=list)

    @classmethod
    def from_model(cls, model, include_correct=False):
        return cls(
            id=model.id,
            text=model.text,
            points=model.points,
            answers=[
                AnswerOptionDTO.from_model(a, include_correct=include_correct)
                for a in model.answers
            ],
        )

    def to_dict(self):
        return {
            "id": self.id,
            "text": self.text,
            "points": self.points,
            "answers": [a.to_dict() for a in self.answers],
        }


@dataclass
class QuizDTO:
    id: int
    title: str
    duration_seconds: int
    status: str | None = None
    rejection_reason: str | None = None
    author_id: int | None = None
    author_name: str | None = None
    created_at: str | None = None
    questions: list[QuestionDTO] = field(default_factory=list)

    @classmethod
    def from_model(
        cls,
        model,
        author_name=None,
        include_questions=False,
        include_correct=False,
    ):
        return cls(
            id=model.id,
            title=model.title,
            duration_seconds=model.duration_seconds,
            status=getattr(model, "status", None),
            rejection_reason=getattr(model, "rejection_reason", None),
            author_id=getattr(model, "author_id", None),
            author_name=author_name,
            created_at=model.created_at.isoformat() if model.created_at else None,
            questions=[
                QuestionDTO.from_model(q, include_correct=include_correct)
                for q in (model.questions if include_questions else [])
            ],
        )

    def to_dict(self):
        base = _omit_none(
            {
                "id": self.id,
                "title": self.title,
                "durationSeconds": self.duration_seconds,
                "status": self.status,
                "rejectionReason": self.rejection_reason,
                "authorId": self.author_id,
                "authorName": self.author_name,
                "createdAt": self.created_at,
            }
        )
        if self.questions:
            base["questions"] = [q.to_dict() for q in self.questions]
        return base


@dataclass
class UserDTO:
    id: int
    first_name: str
    last_name: str
    email: str
    role: str
    birth_date: str | None = None
    gender: str | None = None
    country: str | None = None
    street: str | None = None
    street_number: str | None = None
    profile_image: str | None = None
    created_at: str | None = None

    @classmethod
    def from_model(cls, model):
        return cls(
            id=model.id,
            first_name=model.first_name,
            last_name=model.last_name,
            email=model.email,
            role=model.role,
            birth_date=model.birth_date.isoformat() if model.birth_date else None,
            gender=model.gender,
            country=model.country,
            street=model.street,
            street_number=model.street_number,
            profile_image=model.profile_image,
            created_at=model.created_at.isoformat() if model.created_at else None,
        )

    def to_dict(self):
        return _omit_none(
            {
                "id": self.id,
                "firstName": self.first_name,
                "lastName": self.last_name,
                "email": self.email,
                "role": self.role,
                "birthDate": self.birth_date,
                "gender": self.gender,
                "country": self.country,
                "street": self.street,
                "streetNumber": self.street_number,
                "profileImage": self.profile_image,
                "createdAt": self.created_at,
            }
        )


@dataclass
class QuizAttemptDTO:
    player_id: int
    name: str | None
    score: int | None
    duration_seconds: int | None
    finished_at: str | None

    def to_dict(self):
        return _omit_none(
            {
                "playerId": self.player_id,
                "name": self.name,
                "score": self.score,
                "durationSeconds": self.duration_seconds,
                "finishedAt": self.finished_at,
            }
        )
