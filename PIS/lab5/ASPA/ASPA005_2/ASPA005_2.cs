using DAL003;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.Extensions.FileProviders;
using System.IO;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();


Repository.JSONFilename = "Celebrities.json";
using (IRepository repository = Repository.Create("Celebrities"))
{
    app.UseExceptionHandler("/Celebrities/Error");

    RouteGroupBuilder api = app.MapGroup("/Celebrities");

    api.MapGet("/", () => repository.getAllCelebrities());
    api.MapGet("/{id:int}", (int id) =>
    {
        Celebrity? celebrity = repository.getCelebrityById(id);
        if (celebrity == null) throw new FoundByIdException($"Celebrity Id = {id}");
        return celebrity;
    });


    Validation.SurnameFilter.repository = Validation.PhotoExistsFilter.repository = repository;

    api.MapPost("/", (Celebrity celebrity) =>
    {
        int? id = repository.addCelebrity(celebrity);
        if (id == null) throw new AddCelebrityException("/Celebrities error, id == null");
        if (repository.SaveChanges() <= 0) throw new SaveException("/Celebrities error, SaveChanges() <= 0");
        return new Celebrity((int)id, celebrity.Firstname, celebrity.Surname, celebrity.PhotoPath);
    })
    .AddEndpointFilter<Validation.SurnameFilter>()
    .AddEndpointFilter<Validation.PhotoExistsFilter>();

    api.MapPut("/{id:int}", (int id, Celebrity celebrity) =>
    {
        if (repository.updateCelebrity(id, celebrity) != null)
        {
            return new Celebrity(id, celebrity.Firstname, celebrity.Surname, celebrity.PhotoPath);
        }
        throw new UpdateException("/Celebrities update error");
    })
    .AddEndpointFilter<Validation.UpdateFilter>();

    api.MapDelete("/{id:int}", (int id) =>
    {
        if (!repository.deleteCelebrity(id)) throw new DeleteException($"/Celebrities delete error for id {id}");
        repository.SaveChanges();
        return Results.Ok($"Celebrity with Id = {id} deleted");
    })
    .AddEndpointFilter<Validation.DeleteFilter>();

    app.MapFallback((HttpContext ctx) => Results.NotFound(new { error = $"path {ctx.Request.Path} not supported" }));

    api.Map("/Error", (HttpContext ctx) =>
    {
        Exception? ex = ctx.Features.Get<IExceptionHandlerFeature>()?.Error;
        IResult rc = Results.Problem(detail: ex.Message, instance: app.Environment.EnvironmentName, title: "ASPA004", statusCode: 500);

        if (ex != null)
        {
            if (ex is DeleteException) rc = Results.Problem(title: "ASPA004", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
            if (ex is FileNotFoundException) rc = Results.Problem(title: "ASPA004", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
            if (ex is FoundByIdException) rc = Results.NotFound(ex.Message);
            if (ex is BadHttpRequestException) rc = Results.BadRequest(ex.Message);
            if (ex is SaveException) rc = Results.Problem(title: "ASPA004/SaveChanges", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
            if (ex is AddCelebrityException) rc = Results.Problem(title: "ASPA004/addCelebrity", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
            if (ex is ArgumentNullException) rc = Results.Problem(title: "ASPA005/CelebritiesFilter", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
            if (ex is SurnameException) rc = Results.Problem(title: "ASPA005/CelebritiesFilter", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 409);

        }
        return rc;
    });

    app.Run();
}
public class SurnameException : Exception { public SurnameException(string message) : base($"Filter error: {message}") { } };
public class UpdateException : Exception { public UpdateException(string message) : base($"Update error: {message}") { } };
public class DeleteException : Exception { public DeleteException(string message) : base($"Delete error: {message}") { } };
public class FoundByIdException : Exception { public FoundByIdException(string message) : base($"Found by id error: {message}") { } };
public class SaveException : Exception { public SaveException(string message) : base($"SaveChanges error: {message}") { } };
public class AddCelebrityException : Exception { public AddCelebrityException(string message) : base($"AddCelebrity error: {message}") { } };

