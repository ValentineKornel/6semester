using DAL003;

namespace Validation
{
    public class DeleteFilter : IEndpointFilter
    {
        public static IRepository repository { get; set; }

        public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
        {
            context.HttpContext.Response.Headers.Append("X-Delete", "Some value");
            return await next(context);
        }
    }
}
