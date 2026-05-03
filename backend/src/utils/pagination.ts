import { z } from "zod";
import { RECORDS_PER_PAGE } from "./constants";
export const paginateQuery = async (
    query: any,
    page: number,
    pageSize: number | 'all'
) => {
    //Case: return all data
    if (pageSize === 'all') {
        const data = await query.sort({ _id: -1 });
        const total = data.length;

    return {data, pagination: {
                current_page: 1,
                per_page: total,
                total_items: total,
                last_page: 1
            }
        };
    }

    //Normal pagination
    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
        query.clone().skip(skip).limit(pageSize).sort({ _id: -1 }),
        query.model.countDocuments(query.getQuery())
    ]);

    return {data, pagination: {
                current_page: page,
                per_page: pageSize,
                total_items: total,
                last_page: Math.ceil(total / pageSize)
            }
    };
};

export const paginationSchema = z.object({
    page: z.preprocess(
        (val) => {
            if (val === undefined) return 1;
            const num = Number(val);
            return isNaN(num) ? undefined : num;
        },
        z.number().min(1)
    ),

    page_size: z.preprocess(
        (val) => {
            if (val === undefined) return RECORDS_PER_PAGE;
            if (val === "all") return "all";

            const num = Number(val);
            return isNaN(num) ? undefined : num;
        },
        z.union([
            z.number().min(1),
            z.literal("all")
        ])
    )
});