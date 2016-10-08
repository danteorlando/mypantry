using System.Data.Entity.ModelConfiguration;
using MyPantry.Model;

namespace MyPantry.DataAccess
{
    public class IngredientConfiguration : EntityTypeConfiguration<Ingredient>
    {
        public IngredientConfiguration()
        {
        }
    }
}
