using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;
using MyPantry.Model;

namespace MyPantry.DataAccess
{
    public class MyPantryDbContext : DbContext
    {
        public MyPantryDbContext() : base(nameOrConnectionString: "MyPantry") {}

        static MyPantryDbContext()
        {
            Database.SetInitializer<MyPantryDbContext>(null);
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();

            Configuration.ProxyCreationEnabled = false;
            Configuration.LazyLoadingEnabled = false;

            modelBuilder.Configurations.Add(new PantryItemConfiguration());
            modelBuilder.Configurations.Add(new IngredientConfiguration());
            modelBuilder.Configurations.Add(new RecipeConfiguration());
        }

        public DbSet<PantryItem> PantryItems { get; set; }
        public DbSet<Ingredient> Ingredients { get; set; }
        public DbSet<Recipe> Recipes { get; set; }


    }
}
