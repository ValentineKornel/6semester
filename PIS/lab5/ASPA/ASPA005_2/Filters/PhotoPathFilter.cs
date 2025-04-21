using DAL003;

namespace Validation
{
    public class PhotoExistsFilter : IEndpointFilter
    {
        public static IRepository repository { get; set; }

        public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
        {
            Celebrity celebrity = context.GetArgument<Celebrity>(0);
            if (!File.Exists(Path.Combine(repository.BasePath, celebrity.PhotoPath)))
                context.HttpContext.Response.Headers.Append("X-Celbrity", $"NotFount={celebrity.PhotoPath}");

            return await next(context);
        }
    }
}
