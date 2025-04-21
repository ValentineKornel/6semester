using Microsoft.AspNetCore.HttpLogging;
using Microsoft.Extensions.Logging;

internal class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);


        builder.Services.AddHttpLogging(o =>
        {
            o.LoggingFields = HttpLoggingFields.RequestMethod |
            HttpLoggingFields.RequestPath |
            HttpLoggingFields.ResponseStatusCode;
        });

        builder.Logging.AddFilter("Microsoft.AspNetCore.HttpLogging", LogLevel.Information);

        var app = builder.Build();

        app.UseHttpLogging();
        
        app.MapGet("/", () => "Мое первое ASPA");

        app.Run();
    }
}