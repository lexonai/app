const LexonContent = (() => {
    const resourceTypes = [
        "videos",
        "guides",
        "tools",
        "prompts",
        "courses"
    ];

    const tableMap = {
        videos: "videos",
        guides: "guides",
        tools: "tools",
        prompts: "prompts",
        courses: "courses"
    };

    async function getResources(type, options = {}) {
        const table = tableMap[type];

        if (!table || !window.LexonSupabase?.client()) {
            return [];
        }

        let query = window.LexonSupabase.client()
            .from(table)
            .select("*")
            .eq("status", "published");

        if (options.search) {
            const search = options.search.trim();

            if (search) {
                query = query.or(
                    `title.ilike.%${search}%,description.ilike.%${search}%`
                );
            }
        }

        if (options.category) {
            query = query.eq("category", options.category);
        }

        // Rank by automatic popularity score when the ranking columns
        // exist (see supabase/popularity_ranking.sql). Falls back to
        // newest-first if that migration hasn't been run yet, and to
        // whatever the table default order is if neither is available.
        if (options.orderBy) {
            query = query.order(options.orderBy, {
                ascending: options.ascending === true
            });
        } else if (options.ranked !== false) {
            query = query.order("popularity_score", { ascending: false });
        }

        if (options.limit) {
            query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) {
            // A missing popularity_score column (migration not run yet)
            // must not break the page — retry once without ranking.
            if (options.ranked !== false && /popularity_score/i.test(error.message || "")) {
                return getResources(type, { ...options, ranked: false });
            }

            console.error(`Failed to load ${type}:`, error);
            return [];
        }

        return data || [];
    }

    // Best-effort engagement tracking for the automatic Top Demanded
    // ranking. No-ops quietly if Supabase isn't connected yet or the
    // popularity_ranking.sql migration hasn't been run — never throws
    // into the caller.
    async function trackEngagement(type, id, metric = "views") {
        const table = tableMap[type];
        const client = window.LexonSupabase?.client();

        if (!table || !id || !client) return;

        try {
            await client.rpc("lexon_increment_metric", {
                p_table: table,
                p_id: id,
                p_metric: metric
            });
        } catch (error) {
            // Silent — tracking is a bonus, not a requirement.
        }
    }

    async function searchAll(query, limit = 5) {
        const search = query?.trim();

        if (!search) {
            return {
                videos: [],
                guides: [],
                tools: [],
                prompts: [],
                courses: []
            };
        }

        const results = {};

        for (const type of resourceTypes) {
            results[type] = await getResources(type, {
                search,
                limit
            });
        }

        return results;
    }

    function getResourceUrl(type, id) {
        if (!id) return "#";

        const pages = {
            videos: "videos.html",
            guides: "guides.html",
            tools: "tools.html",
            prompts: "prompts.html",
            courses: "courses.html"
        };

        const page = pages[type];

        if (!page) return "#";

        return `${page}?id=${encodeURIComponent(id)}`;
    }

    return {
        getResources,
        searchAll,
        getResourceUrl,
        trackEngagement
    };
})();

window.LexonContent = LexonContent;