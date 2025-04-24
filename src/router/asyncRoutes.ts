const views = import.meta.glob('/src/views/**/*.vue');

export function mapBackendRoutes(routes) {
    if (!Array.isArray(routes)) {
        console.warn('⚠️ Warning: "routes" is not an array. Received:', routes);
        return [];
    }

    return routes
        .filter(route => route.path || (route.children && route.children.length)) // 保证至少有 path 或 children
        .map(route => {
            let component = null;

            if (route.component) {
                const path1 = `/src/views/${route.component}.vue`;
                const path2 = `/src/views/${route.component}/index.vue`;
                component = views[path1] || views[path2] || null;

                if (!component) {
                    console.warn(`⚠️ 组件未找到: ${route.component}`);
                }
            }

            const routeObj = {
                path: route.path || '',
                name: route.name?.replace(/\s+/g, '-').toLowerCase(),
                ...(component && { component }), // 仅在 component 存在时添加
            };

            if (Array.isArray(route.children) && route.children.length > 0) {
                // @ts-ignore
                routeObj.children = mapBackendRoutes(route.children);
            }

            return routeObj;
        });
}
