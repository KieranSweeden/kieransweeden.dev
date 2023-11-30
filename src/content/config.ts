import { defineCollection, z, reference } from "astro:content";

const blog = defineCollection({
    type: "content",
    schema: z.object({
        title: z.string(),
        description: z.string(),
        isDraft: z.boolean().optional(),
        tags: z.array(z.string()).optional(),
        pubDate: z.coerce.date(),
        relatedPosts: z.array(reference("blog")).optional(),
        updatedDate: z.coerce.date().optional(),
        heroImage: z.string().optional(),
    }),
});

export const collections = { blog };
