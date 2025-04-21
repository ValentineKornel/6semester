using DAL003;
class Program
{

    private static void Main(string[] args)
    {
        Repository.JSONFilename = "Celebrities.json";
        using (IRepository repository = Repository.Create("..\\..\\..\\Celebrities"))
        {
            void print(string label)
            {
                Console.WriteLine($"------------- {label} -------------");
                foreach (Celebrity celebrity in repository.getAllCelebrities())
                {
                    Console.WriteLine($"Id = {celebrity.Id}, Firstname = {celebrity.Firstname}, Surname = {celebrity.Surname}, PhotoPath = {celebrity.PhotoPath}");
                }
            }
            print("start");


            int? testdel1 = repository.addCelebrity(new Celebrity(4, "Noam", "Chomsky", "D:\\Study\\university\\TPWI\\lab4\\ASPA\\Test_DAL003\\Celebrities\\Chomsky.jpg"));
            int? testdel2 = repository.addCelebrity(new Celebrity(5, "Tim", "Berners-Lee", "D:\\Study\\university\\TPWI\\lab4\\ASPA\\Test_DAL003\\Celebrities\\Lee.jpg"));
            int? testupd1 = repository.addCelebrity(new Celebrity(6, "Edgar", "Codd", "D:\\Study\\university\\TPWI\\lab4\\ASPA\\Test_DAL003\\Celebrities\\Codd.jpg"));
            int? testupd2 = repository.addCelebrity(new Celebrity(7, "Donald", "Knuth", "D:\\Study\\university\\TPWI\\lab4\\ASPA\\Test_DAL003\\Celebrities\\Knuth.jpg"));
            repository.SaveChanges();
            print("add 4");

            if (testdel1 != null)
                if (repository.deleteCelebrity((int)testdel1)) Console.WriteLine($" delete {testdel1}"); else Console.WriteLine($" delete {testdel1} error");
            if (testdel2 != null)
                if (repository.deleteCelebrity((int)testdel2)) Console.WriteLine($" delete {testdel2}"); else Console.WriteLine($" delete {testdel2} error");
            if (repository.deleteCelebrity(1000)) Console.WriteLine($" delete {1000}"); else Console.WriteLine($" delete {1000} error");
            repository.SaveChanges();
            print("del 2");

            if (testupd2 != null)
            {
                if (repository.updateCelebrity((int)testupd1, new Celebrity((int)testupd1, "Edgar_upd", "Codd_upd", "D:\\Study\\university\\TPWI\\lab4\\ASPA\\Test_DAL003\\Celebrities\\Codd.jpg")) != null)
                    Console.WriteLine($" update {testupd1} ");
                else
                    Console.WriteLine($" update {testupd1} error");
            }
            if (testupd1 != null)
            {
                if (repository.updateSelebrity((int)testupd2, new Celebrity((int)testupd2, "Donald_upd", "Knuth_upd", "D:\\Study\\university\\TPWI\\lab4\\ASPA\\Test_DAL003\\Celebrities\\Knuth.jpg.jpg")) != null)
                    Console.WriteLine($" update {testupd2} ");
                else
                    Console.WriteLine($" update {testupd2} erro");
            }
            if (repository.updateSelebrity(1000, new Celebrity(1000, "Donald_upd", "Knuth_upd", "D:\\Study\\university\\TPWI\\lab4\\ASPA\\Test_DAL003\\Celebrities\\Knuth.jpg.jpg")) != null)
                Console.WriteLine($" update {1000} ");
            else
                Console.WriteLine($" update {1000} error");
            repository.SaveChanges();
            print("upd 2");


        }


        //private static void Main(string[] args)
        //{
        //    Repository.JSONFilename = "Celebrities.json";
        //    using (IRepository repository = Repository.Create("..\\..\\..\\Celebrities"))
        //    {
        //        foreach (Celebrity celebrity in repository.getAllCelebrities())
        //        {
        //            Console.WriteLine($"Id = {celebrity.Id}, Firstname = {celebrity.Firstname}, Surname = {celebrity.Surname}, PhotoPath = {celebrity.PhotoPath}");
        //        }

        //        Celebrity? celebrity1 = repository.getCelebrityById(1);
        //        if (celebrity1 != null)
        //        {
        //            Console.WriteLine($"Celebrity with id {celebrity1.Id} = Firstname: {celebrity1.Firstname}, Surname: {celebrity1.Surname}, PhotoPath: {celebrity1.PhotoPath}");
        //        }

        //        Celebrity? celebrity2 = repository.getCelebrityById(5);
        //        if (celebrity2 != null)
        //        {
        //            Console.WriteLine($"Celebrity with id {celebrity2.Id} = Firstname: {celebrity2.Firstname}, Surname: {celebrity2.Surname}, PhotoPath: {celebrity2.PhotoPath}");
        //        }

        //        Celebrity? celebrity222 = repository.getCelebrityById(222);
        //        if (celebrity222 != null)
        //        {
        //            Console.WriteLine($"Celebrity with id {celebrity222.Id} = Firstname: {celebrity222.Firstname}, Surname: {celebrity222.Surname}, PhotoPath: {celebrity222.PhotoPath}");
        //        }
        //        else Console.WriteLine("Not found 222");

        //        foreach (Celebrity celebrity in repository.getCelebritiesBySurname("Chomsky"))
        //        {
        //            Console.WriteLine($"Id = {celebrity.Id}, Firstname = {celebrity.Firstname}, Surname = {celebrity.Surname}, PhotoPath = {celebrity.PhotoPath}");
        //        }

        //        foreach (Celebrity celebrity in repository.getCelebritiesBySurname("Knuth"))
        //        {
        //            Console.WriteLine($"Id = {celebrity.Id}, Firstname = {celebrity.Firstname}, Surname = {celebrity.Surname}, PhotoPath = {celebrity.PhotoPath}");
        //        }

        //        foreach (Celebrity celebrity in repository.getCelebritiesBySurname("XXX"))
        //        {
        //            Console.WriteLine($"Id = {celebrity.Id}, Firstname = {celebrity.Firstname}, Surname = {celebrity.Surname}, PhotoPath = {celebrity.PhotoPath}");
        //        }

        //        Console.WriteLine($"PhotoPathById = {repository.getPhotoPathById(1)}");
        //        Console.WriteLine($"PhotoPathById = {repository.getPhotoPathById(2)}");
        //        Console.WriteLine($"PhotoPathById = {repository.getPhotoPathById(3)}");
        //    }
    }
}