export class BlogOutputModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
}

// MAPPERS

export const BlogOutputModelMapper = (blog): BlogOutputModel => {
  const outputModel: BlogOutputModel = new BlogOutputModel();

  outputModel.id = blog.id.toString();
  outputModel.name = blog.name;
  outputModel.description = blog.description;
  outputModel.websiteUrl = blog.website_url;
  outputModel.createdAt = blog.created_at;
  outputModel.isMembership = blog.is_membership;

  return outputModel;
};
