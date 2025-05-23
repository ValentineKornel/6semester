using ASPA006_1;

internal class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.AddCelebritiesConfiguration();

        builder.AddSelebritiesServices();

        builder.Services.AddControllersWithViews();
        var app = builder.Build();

        app.UseHttpsRedirection();

        if (!app.Environment.IsDevelopment())
        {
            app.UseExceptionHandler("/Home/Error");
        }
        app.UseStaticFiles();
        app.UseRouting();

        app.UseCelebritiesErrorHandler();
        app.MapCelebrities();
        app.MapLifeevents();
        app.MapPhotoCelebrities();

        app.UseAuthorization();

        app.MapControllerRoute(
            name: "celebrity",
            pattern: "/0",
            defaults: new { Controller = "Celebrities", Action = "NewHumanForm" });

        app.MapControllerRoute(
            name: "celebrity",
            pattern: "/{id:int:min(1)}",
            defaults: new { Controller = "Celebrities", Action = "Human" });

        app.MapControllerRoute(
            name: "default",
            pattern: "{controller=Celebrities}/{action=Index}/{id?}");

        app.Run();
    }
}