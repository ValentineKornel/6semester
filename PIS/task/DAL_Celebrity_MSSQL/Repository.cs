using DAL_Celebrity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Collections.Generic;

namespace DAL_Celebrity_MSSQL
{ 
    public class Repository : IRepository
    {
        Context context;
        public Repository() { this.context = new Context(); }
        public Repository(string connectionstring) { this.context = new Context(connectionstring); }
        public static IRepository Create() { return new Repository(); }
        public static IRepository Create(string connectionstring) { return new Repository(connectionstring); }
        public List<Celebrity> GetAllCelebrities() { return this.context.Celebrities.ToList<Celebrity>(); }
        public Celebrity? GetCelebrityById(int Id)
        {
            return  this.context.Celebrities.FirstOrDefault((c) => c.Id == Id);
        }
        public bool AddCelebrity(Celebrity celebrity)
        {
            this.context.Celebrities.Add(celebrity);
            return this.context.SaveChanges() > 0;
        }
        public int AddCelebrityAndGetId(Celebrity celebrity)
        {
            int rc = 0;
            EntityEntry ee =  this.context.Celebrities.Add(celebrity);
            if (this.context.SaveChanges() > 0 )  rc = ((Celebrity)ee.Entity).Id;
            return rc; 
        }
        public bool DelCelebrity(int id)
        {
            bool rc = false;    
            Celebrity? c = GetCelebrityById(id);
            if (c != null)
            {
                this.context.Celebrities.Remove(c);
                rc = this.context.SaveChanges() > 0;  
            }
            return rc; 
        }
        public bool UpdCelebrity(int id, Celebrity celebrity)
        {
            bool rc = false;
            Celebrity? c = GetCelebrityById(id);
            if (rc = (c != null)) 
            {
              if (c.Update(celebrity))
              {
                    this.context.Celebrities.Entry(c).State = EntityState.Modified;
                    rc = this.context.SaveChanges() > 0;
              } 
            }
            return rc;
        }
        public List<Lifeevent> GetAllLifeevents() { return this.context.Lifeevents.ToList<Lifeevent>(); }
        public Lifeevent? GetLifeevetById(int Id)
        {
            return this.context.Lifeevents.FirstOrDefault((l) => l.Id == Id);
        }
        public bool AddLifeevent(Lifeevent lifeevent)
        {
            bool rc  = false;
            Celebrity? c = GetCelebrityById(lifeevent.CelebrityId);
            if (rc = (c != null))
            {
                this.context.Lifeevents.Add(lifeevent);
                rc =  this.context.SaveChanges() > 0;
            }
            return rc; 
        }
        public bool DelLifeevent(int id)
        {
            bool rc = false;
            Lifeevent? l = GetLifeevetById(id);
            if (l != null)
            {
              this.context.Lifeevents.Remove(l);
              rc = this.context.SaveChanges() > 0;
            }
            return rc;  
        }
        public bool UpdLifeevent(int id, Lifeevent lifeevent)
        {
            bool rc = false;
            Lifeevent? l = GetLifeevetById(id);
            if (rc = (l != null))
            {
                if (rc = l.Update(lifeevent))
                {
                    this.context.Lifeevents.Entry(l).State = EntityState.Modified;
                    rc = this.context.SaveChanges() > 0;
                }
            }
            return rc;
        }
        public List<Lifeevent> GetLifeeventsByCelebrityId(int celebrityId)
        {
           return this.context.Lifeevents.Where<Lifeevent>((l)=>l.CelebrityId == celebrityId).ToList<Lifeevent>();           
        }
        public Celebrity? GetCelebrityByLifeeventId(int lifeeventId)
        {
            Celebrity? rc = null; 
            Lifeevent? l  =  this.GetLifeevetById(lifeeventId);
            if (l != null) rc = this.GetCelebrityById(l.CelebrityId);
            return rc;
        }
        public int GetCelebrityIdByName(string name)
        {
            int rc = -1;
            Celebrity? c = this.context.Celebrities.FirstOrDefault(c => c.FullName.Contains(name));
            if (c != null)  rc = c.Id;
            return rc;  
        }
        public void Dispose()
        {
            //throw new NotImplementedException();
        }
    }
    
}




//public class Celebrity: DAL_Celebrity.Celebrity { }
    //public class Lifeevent: DAL_Celebrity.Lifeevent {

//public List<Comment> getAllComment() { return this.context.Comments.ToList<Comment>(); }
//public List<WSRef> getAllWSRef() { return this.context.WSRefs.ToList<WSRef>(); }
//public bool addWSRef(WSRef wsref)
//{
//    bool rc = false;
//    context.Database.BeginTransaction();
//    context.WSRefs.Add(wsref);
//    rc = (context.SaveChanges() > 0);
//    context.Database.CommitTransaction();
//    return rc;
//}
//public void Dispose() { this.context.Dispose(); }
//public Comment? GetCommentById(int Id)
//{
//    return this.context.Comments.FirstOrDefault<Comment>((c) => c.Id == Id);
//}