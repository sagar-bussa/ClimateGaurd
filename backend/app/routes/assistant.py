from fastapi import APIRouter
from ..schemas.weather import ChatQueryRequest, ChatQueryResponse
from ..services.assistant_service import ClimateAssistantService

router = APIRouter(prefix="/api/assistant", tags=["AI Climate Assistant"])

@router.post("/chat", response_model=ChatQueryResponse)
async def chat_with_assistant(req: ChatQueryRequest):
    """
    AI Climate Assistant grounded strictly in verified environmental observation data.
    """
    return await ClimateAssistantService.answer_query(
        user_message=req.message,
        context_data=req.context_data
    )
