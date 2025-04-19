const views = import.meta.glob('/src/views/**/*.vue');

export function mapBackendRoutes(routes) {
    if (!Array.isArray(routes)) {
        console.warn('⚠️ Warning: "routes" is not an array. Received:', routes);
        return [];
    }

    return routes.map(route => {
        // 初始化组件为空
        let component = null;

        let componentPath1 = `/src/views/${route.component}.vue`;
        if (views[componentPath1]) {
            component = views[componentPath1];
        }

        if (!component) {
            let componentPath2 = `/src/views/${route.component}/index.vue`;
            if (views[componentPath2]) {
                component = views[componentPath2];
            }
        }

        // 如果找不到组件，输出警告
        if (!component) {
            // console.error(`❌ 组件未找到: ${route.component}`);
        }

        // 构造路由对象
        const r = {
            path: route.path,
            name: route.name,
            component: component,
            children: []
        };

        // 递归处理子路由
        if (Array.isArray(route.children) && route.children.length > 0) {
            r.children = mapBackendRoutes(route.children);
        }

        return r;
    });
}