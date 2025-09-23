from google.generativeai.client import configure
from google.generativeai.generative_models import GenerativeModel
from ..config import settings
from typing import Dict, List

class AIService:
    def __init__(self, model_name: str = "gemini-1.5-flash"):
        if not settings.google_api_key or settings.google_api_key == "your_google_api_key":
            raise ValueError("Google API key not configured. Please set a valid GOOGLE_API_KEY in .env")

        configure(api_key=settings.google_api_key)
        self.model = GenerativeModel(model_name)

    def repurpose_content(self, raw_content: str, target_platforms: List[str], tone: str) -> Dict[str, str]:
        """
        Repurpose content for different platforms using Gemini 1.5 API

        Args:
            raw_content: Original content to repurpose
            target_platforms: List of platforms (twitter, linkedin, instagram, newsletter)
            tone: Overall tone (professional, casual, etc.)

        Returns:
            Dict with platform-specific repurposed content
        """
        result = {}

        for platform in target_platforms:
            if platform.lower() == "twitter":
                result["twitter"] = self._repurpose_for_twitter(raw_content, tone)
            elif platform.lower() == "linkedin":
                result["linkedin"] = self._repurpose_for_linkedin(raw_content, tone)
            elif platform.lower() == "instagram":
                result["instagram"] = self._repurpose_for_instagram(raw_content, tone)
            elif platform.lower() == "newsletter":
                result["newsletter"] = self._repurpose_for_newsletter(raw_content, tone)

        return result

    def _repurpose_for_twitter(self, content: str, tone: str) -> str:
        """Create Twitter thread (280 char limit per tweet)"""
        prompt = f"""
        Repurpose this content into a Twitter thread with {tone} tone.
        Requirements:
        - Each tweet max 280 characters
        - Create 3-5 connected tweets
        - Use emojis and hashtags
        - Make it engaging for Twitter audience
        - Number the tweets (1/5, 2/5, etc.)

        Original content: {content}

        Format as: Tweet 1: [content]
        Tweet 2: [content]
        etc.
        """

        response = self.model.generate_content(prompt)
        return response.text.strip()

    def _repurpose_for_linkedin(self, content: str, tone: str) -> str:
        """Create LinkedIn post (200-300 words, professional)"""
        prompt = f"""
        Repurpose this content into a LinkedIn post with {tone} tone.
        Requirements:
        - 200-300 words
        - Professional and insightful
        - Include relevant hashtags
        - Add a call-to-action
        - Structure with paragraphs and bullet points if appropriate

        Original content: {content}
        """

        response = self.model.generate_content(prompt)
        return response.text.strip()

    def _repurpose_for_instagram(self, content: str, tone: str) -> str:
        """Create Instagram caption with hashtags"""
        prompt = f"""
        Create an Instagram caption for this content with {tone} tone.
        Requirements:
        - Engaging caption (100-150 words)
        - Include relevant emojis
        - Add 10-15 relevant hashtags
        - Make it visually appealing in text form
        - End with a question or call-to-action

        Original content: {content}

        Format as: Caption text followed by hashtags on new lines.
        """

        response = self.model.generate_content(prompt)
        return response.text.strip()

    def _repurpose_for_newsletter(self, content: str, tone: str) -> str:
        """Create newsletter content (300-500 words, casual storytelling)"""
        prompt = f"""
        Repurpose this content into a newsletter article with {tone} tone.
        Requirements:
        - 300-500 words
        - Casual, storytelling style
        - Engaging introduction and conclusion
        - Break into sections with subheadings
        - Include practical takeaways
        - Make it conversational and relatable

        Original content: {content}
        """

        response = self.model.generate_content(prompt)
        return response.text.strip()

# Global instance for backward compatibility
ai_service = AIService()

def repurpose_content(content: str, platforms: list, tone: str) -> dict:
    """Legacy function for backward compatibility"""
    return ai_service.repurpose_content(content, platforms, tone)
