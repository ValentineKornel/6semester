using Azure;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.SqlServer;
using DAL_Celebrity;
using DAL_Celebrity_MSSQL;
using System.Reflection.Emit;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace DAL_Celebrity_MSSQL
{ 
    public class Context : DbContext
    {
        //const string  SCHEMA = "CELEBRITIES";
        const string  SCHEMA = "dbo";
        public string? ConnectionString {get; private set;} = null;
        public Context(string connstring) : base()
        {
            this.ConnectionString = connstring;   
            //this.Database.EnsureDeleted();
            this.Database.EnsureCreated();
        }
        public Context() : base() { 
            //this.Database.EnsureDeleted(); 
            this.Database.EnsureCreated(); }
        public DbSet<Celebrity> Celebrities { get; set; }
        public DbSet<Lifeevent> Lifeevents { get; set; }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (this.ConnectionString is null) this.ConnectionString = "Data Source=DESKTOP-0M3BPJP;Initial Catalog=Temp;Integrated Security=True;Trust Server Certificate=True";
            optionsBuilder.UseSqlServer(this.ConnectionString);
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Celebrity>().ToTable("Celebrities",SCHEMA).HasKey(p=>p.Id);
            modelBuilder.Entity<Celebrity>().Property(p => p.Id).IsRequired();
            modelBuilder.Entity<Celebrity>().Property(p => p.FullName).IsRequired().HasMaxLength(50);
            modelBuilder.Entity<Celebrity>().Property(p => p.Nationality).IsRequired().HasMaxLength(2);
            modelBuilder.Entity<Celebrity>().Property(p => p.ReqPhotoPath).HasMaxLength(200);
           
            modelBuilder.Entity<Lifeevent>().ToTable("Lifeevents", SCHEMA).HasKey(p => p.Id);
            //modelBuilder.Entity<Lifeevent>().ToTable("Lifeevents");
            modelBuilder.Entity<Lifeevent>().Property(p => p.Id).IsRequired();
            modelBuilder.Entity<Lifeevent>().ToTable("Lifeevents",SCHEMA).HasOne<Celebrity>().WithMany().HasForeignKey(p =>p.CelebrityId); 
            modelBuilder.Entity<Lifeevent>().Property(p => p.CelebrityId).IsRequired();
            modelBuilder.Entity<Lifeevent>().Property(p => p.Date);
            modelBuilder.Entity<Lifeevent>().Property(p => p.Description).HasMaxLength(256);
            modelBuilder.Entity<Lifeevent>().Property(p => p.ReqPhotoPath).HasMaxLength(256);
            base.OnModelCreating(modelBuilder);
        }
    }
    public class AuthDbContext : IdentityDbContext
    {
        public AuthDbContext(DbContextOptions<AuthDbContext> options)
            : base(options)
        {
           this.Database.EnsureCreated();
        }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            //builder.Entity<IdentityUser>().ToTable("AspNetUsers", "dbo");
            //builder.Entity<IdentityRole>().ToTable("AspNetRoles", "dbo");
            //builder.Entity<IdentityUserRole<string>>().ToTable("AspNetUserRoles", "dbo");
            //builder.Entity<IdentityUserClaim<string>>().ToTable("AspNetUserClaims", "dbo");
            //builder.Entity<IdentityUserLogin<string>>().ToTable("AspNetUserLogins", "dbo");
            //builder.Entity<IdentityRoleClaim<string>>().ToTable("AspNetRoleClaims", "dbo");
            //builder.Entity<IdentityUserToken<string>>().ToTable("AspNetUserTokens", "dbo");
            builder.Entity<IdentityUser>().ToTable("AspNetUsers", "IDENTITY");
            builder.Entity<IdentityRole>().ToTable("AspNetRoles", "IDENTITY");
            builder.Entity<IdentityUserRole<string>>().ToTable("AspNetUserRoles", "IDENTITY");
            builder.Entity<IdentityUserClaim<string>>().ToTable("AspNetUserClaims", "IDENTITY");
            builder.Entity<IdentityUserLogin<string>>().ToTable("AspNetUserLogins", "IDENTITY");
            builder.Entity<IdentityRoleClaim<string>>().ToTable("AspNetRoleClaims", "IDENTITY");
            builder.Entity<IdentityUserToken<string>>().ToTable("AspNetUserTokens", "IDENTITY");
        }
    }




}
//modelBuilder.Entity<Celebrity>().ToTable("Celebrities").HasKey(p => p.Id);
//modelBuilder.Entity<Celebrity>().Property(p => p.Id).IsRequired();
//modelBuilder.Entity<Celebrity>().Property(p => p.FullName).IsRequired().HasMaxLength(50);
//modelBuilder.Entity<Celebrity>().Property(p => p.Nationality).IsRequired().HasMaxLength(2);
//modelBuilder.Entity<Celebrity>().Property(p => p.ReqPhotoPath).HasMaxLength(200);

//modelBuilder.Entity<Lifeevent>().ToTable("Lifeevents").HasKey(p => p.Id);
//modelBuilder.Entity<Lifeevent>().ToTable("Lifeevents");
//modelBuilder.Entity<Lifeevent>().Property(p => p.Id).IsRequired();
//modelBuilder.Entity<Lifeevent>().ToTable("Lifeevents").HasOne<Celebrity>().WithMany().HasForeignKey(p => p.CelebrityId);
//modelBuilder.Entity<Lifeevent>().Property(p => p.CelebrityId).IsRequired();
//modelBuilder.Entity<Lifeevent>().Property(p => p.Date);
//modelBuilder.Entity<Lifeevent>().Property(p => p.Description).HasMaxLength(256);
//modelBuilder.Entity<Lifeevent>().Property(p => p.ReqPhotoPath).HasMaxLength(256);
//base.OnModelCreating(modelBuilder);