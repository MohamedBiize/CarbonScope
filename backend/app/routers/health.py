#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Health check endpoint for l'API CarbonScope
"""

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/health", tags=["health"])
async def health_check():
    """
    Endpoint de vérification de l'état de l'API
    """
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"status": "healthy", "message": "L'API CarbonScope fonctionne correctement"}
    )
