using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace ASPA008_1.Helpers
{
    public static class CelebrityHelpers
    {
        public static HtmlString CelebrityPhoto(this IHtmlHelper html, int id, string title, string src)
        {
            // Переход при клике
            string onclick = $"location.href='/{id}'";

            // Корректный расчёт размеров изображения
            string onload = @"
        const h = 150;
        const k = this.naturalWidth / this.naturalHeight;
        this.height = h;
        this.width = Math.round(h * k);
    ".Replace("\n", "").Replace("\r", "").Trim();

            // Сам HTML-код изображения
            string result = $"""
        <img 
            id="{id}"
            class="celebrity-photo"
            title="{title}"
            src="{src}"
            onclick="{onclick}"
            onload="{onload}" />
    """;

            return new HtmlString(result);
        }

    }
}
