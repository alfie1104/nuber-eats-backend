import { EntityRepository, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

//Repository를 extends해서 새로운 함수를 갖는 custom repository 생성이 가능함.
@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
  async getOrCreate(name: string): Promise<Category> {
    /*
    입력으로 받은 categoryName에 해당하는 category가 존재하는지 확인하고 존재하면 category를 return, 
    없으면 새로운 category를 생성해서 return한다.
    */

    //사용자가 입력한 CategoryName에서 앞,뒤 공백을 제거하고 소문자로 변환
    const categoryName = name.trim().toLowerCase();

    //CategoryName에서 중간에 존재하는 공백들을 -로 변환시킨 slug생성

    const categorySlug = categoryName.replace(/ /g, '-');
    let category = await this.findOne({ slug: categorySlug });

    if (!category) {
      category = await this.save(
        this.create({
          slug: categorySlug,
          name: categoryName,
        }),
      );
    }

    return category;
  }
}
