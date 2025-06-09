{
    "data": [
        {
            "id": 1,
            "name": "GPT-4o",
            "description": "GPT-4.1 is a large multimodal language model developed by OpenAI, capable of understanding and generating natural language and code.",
            "is_active": true,
            "supported_file_formats": []
        },
        {
            "id": 5,
            "name": "GPT-4o-mini",
            "description": "GPT-4o-mini",
            "is_active": true,
            "supported_file_formats": [
                "png",
                "jpg",
                "jpeg"
            ]
        },
        {
            "id": 6,
            "name": "Gemini-1.5-flash",
            "description": "Gemini-1.5-flash",
            "is_active": true,
            "supported_file_formats": []
        },
        {
            "id": 7,
            "name": "Gemini-Pro",
            "description": "Gemini-Pro",
            "is_active": true,
            "supported_file_formats": []
        }
    ],
    "message": "Success",
    "sql_info": {
        "query": "SELECT [ai_models].[id], [ai_models].[name], [ai_models].[description], [ai_models].[is_active], [ai_models].[supported_file_formats] FROM [ai_models] WHERE [ai_models].[is_active] = True",
        "execution_time": 1.7435996532440186
    }
}
