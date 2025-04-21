using DAL003;

namespace Validation
{
    public class UpdateFilter : IEndpointFilter
    {
        public static IRepository repository { get; set; }

        public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
        {
            var celebrity = context.GetArgument<Celebrity>(0);
            if (string.IsNullOrWhiteSpace(celebrity.Surname) || celebrity.Surname.Length <= 2)
            {
                throw new SurnameException("/Celebrities error: Surname is wrong");
            }


            if (repository.getAllCelebrities().Any(c => c.Surname == celebrity.Surname))
            {
                throw new SurnameException("/Celebrities error: Surname is doubled");
            }

            return await next(context);
        }
    }
}
