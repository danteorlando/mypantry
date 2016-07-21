using System.Data.Entity.ModelConfiguration;
using MyPantry.Model;

namespace MyPantry.DataAccess
{
    public class RecipeIngredientConfiguration : EntityTypeConfiguration<RecipeIngredient>
    {
        public RecipeIngredientConfiguration()
        {

            HasKey(ri => new { ri.RecipeId, ri.IngredientId });

            HasRequired(ri => ri.Recipe)
                .WithMany(r => r.RecipeIngredientList)
                .HasForeignKey(ri => ri.RecipeId)
                .WillCascadeOnDelete(false);
            HasRequired(ri => ri.Ingredient)
                .WithMany(i => i.RecipeIngredientList)
                .HasForeignKey(ri => ri.IngredientId)
                .WillCascadeOnDelete(false);
        }
    }
}
