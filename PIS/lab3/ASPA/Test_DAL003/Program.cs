using DAL003;
using DAL003.Repositories;
using DAL003.Interfaces;

class Program
{
    private static void Main(string[] args)
    {
        Repository.JSONFilename = "Celebrities.json";
        using (IRepository repository = new Repository("D:\\Study\\university\\PIS\\лаб3\\ASPA\\DAL003\\Celebrities\\"))
        {
            //Console.WriteLine($"Massive: {repository.getAllCelebrities()}");
            foreach (DAL003.Interfaces.Celebrity celebrity in repository.getAllCelebrities())
            {
                Console.WriteLine($"Id = {celebrity.Id}, Firstname = {celebrity.Firstname}, Surname = {celebrity.Surname}, PhotoPath = {celebrity.PhotoPath}");
            }

            DAL003.Interfaces.Celebrity? celebrity1 = repository.getCelebrityById(1);
            if (celebrity1 != null)
            {
                Console.WriteLine($"Celebrity with id {celebrity1.Id} = Firstname: {celebrity1.Firstname}, Surname: {celebrity1.Surname}, PhotoPath: {celebrity1.PhotoPath}");
            }

            DAL003.Interfaces.Celebrity? celebrity2 = repository.getCelebrityById(5);
            if (celebrity2 != null)
            {
                Console.WriteLine($"Celebrity with id {celebrity2.Id} = Firstname: {celebrity2.Firstname}, Surname: {celebrity2.Surname}, PhotoPath: {celebrity2.PhotoPath}");
            }

            DAL003.Interfaces.Celebrity? celebrity222 = repository.getCelebrityById(222);
            if (celebrity222 != null)
            {
                Console.WriteLine($"Celebrity with id {celebrity222.Id} = Firstname: {celebrity222.Firstname}, Surname: {celebrity222.Surname}, PhotoPath: {celebrity222.PhotoPath}");
            }
            else Console.WriteLine("Not found 222");

            foreach (DAL003.Interfaces.Celebrity celebrity in repository.getCelebritiesBySurname("Chomsky"))
            {
                Console.WriteLine($"Id = {celebrity.Id}, Firstname = {celebrity.Firstname}, Surname = {celebrity.Surname}, PhotoPath = {celebrity.PhotoPath}");
            }

            foreach (DAL003.Interfaces.Celebrity celebrity in repository.getCelebritiesBySurname("Knuth"))
            {
                Console.WriteLine($"Id = {celebrity.Id}, Firstname = {celebrity.Firstname}, Surname = {celebrity.Surname}, PhotoPath = {celebrity.PhotoPath}");
            }

            foreach (DAL003.Interfaces.Celebrity celebrity in repository.getCelebritiesBySurname("XXX"))
            {
                Console.WriteLine($"Id = {celebrity.Id}, Firstname = {celebrity.Firstname}, Surname = {celebrity.Surname}, PhotoPath = {celebrity.PhotoPath}");
            }

            Console.WriteLine($"PhotoPathById = {repository.getPhotoPathById(1)}");
            Console.WriteLine($"PhotoPathById = {repository.getPhotoPathById(2)}");
            Console.WriteLine($"PhotoPathById = {repository.getPhotoPathById(3)}");
        }
    }
}