// SVG Icon Library
const ICONS = {
    music: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>`,
    folder: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>`,
    calendar: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>`,
    code: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>`,
    flask: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>`,
    chart: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>`,
    palette: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>`,
    cube: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"/>`,
    'map-flag': `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A2 2 0 013 15.488V5.08a2 2 0 012.161-1.991l6.102.702a2 2 0 001.474-.333l4.446-2.964A2 2 0 0120 2.223V12.5a2 2 0 01-1.162 1.819L14 16.5m-5 3.5v-9.5m5 6V10"/>`,
    'map-pin': `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>`,
    globe: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
    package: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>`,
    refresh: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>`,
    camera: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>`,
    chip: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>`,
    fold: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/>`,
    laptop: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>`,
    smartphone: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>`,
    education: `<path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"/>`,
    briefcase: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>`,
    location: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>`,
    mail: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>`,
    external: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>`,
    chevron: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>`,
    document: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>`,
    gmail: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M22 6l-10 7L2 6"/>`,
    github: `<path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/>`,
    instagram: `<path fill-rule="evenodd" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>`,
    twitter: `<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 4.07H5.078z"/>`,
    facebook: `<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>`
};

const SOCIAL_COLORS = { github: 'slate', instagram: 'pink', twitter: 'slate', facebook: 'indigo' };
const FILLED_ICONS = ['github', 'instagram', 'twitter', 'facebook'];

function svg(name, cls = 'w-5 h-5', filled = false) {
    const isFilled = filled || FILLED_ICONS.includes(name);
    return `<svg class="${cls}" ${isFilled ? 'fill="currentColor"' : 'fill="none" stroke="currentColor"'} viewBox="0 0 24 24">${ICONS[name] || ''}</svg>`;
}

// Color map for hover borders
const COLOR_MAP = {
    emerald: { hover: 'hover:border-emerald-500/50 dark:hover:border-emerald-500/50', bg: 'bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', title: 'text-emerald-950 dark:text-emerald-100', tagBg: 'bg-emerald-200/80 dark:bg-emerald-900/50', tagText: 'text-emerald-800 dark:text-emerald-200', tagBorder: 'border-emerald-500/10' },
    indigo: { hover: 'hover:border-indigo-500/50 dark:hover:border-indigo-500/50', bg: 'bg-indigo-500/20', text: 'text-indigo-700 dark:text-indigo-400', title: 'text-indigo-950 dark:text-indigo-100', tagBg: 'bg-indigo-200/80 dark:bg-indigo-900/50', tagText: 'text-indigo-800 dark:text-indigo-200', tagBorder: 'border-indigo-500/10' },
    blue: { hover: 'hover:border-blue-500/50 dark:hover:border-blue-500/50', bg: 'bg-blue-500/20', text: 'text-blue-700 dark:text-blue-400', title: 'text-blue-950 dark:text-blue-100', tagBg: 'bg-blue-200/80 dark:bg-blue-900/50', tagText: 'text-blue-800 dark:text-blue-200', tagBorder: 'border-blue-500/10' },
    orange: { hover: 'hover:border-orange-500/50 dark:hover:border-orange-500/50', bg: 'bg-orange-500/20', text: 'text-orange-700 dark:text-orange-400', title: 'text-orange-950 dark:text-orange-100', tagBg: 'bg-orange-200/80 dark:bg-orange-900/50', tagText: 'text-orange-800 dark:text-orange-200', tagBorder: 'border-orange-500/10' },
    purple: { hover: 'hover:border-purple-500/50 dark:hover:border-purple-500/50', bg: 'bg-purple-500/20', text: 'text-purple-700 dark:text-purple-400', title: 'text-purple-950 dark:text-purple-100', tagBg: 'bg-purple-200/80 dark:bg-purple-900/50', tagText: 'text-purple-800 dark:text-purple-200', tagBorder: 'border-purple-500/10' },
    rose: { hover: 'hover:border-rose-500/50 dark:hover:border-rose-500/50', bg: 'bg-rose-500/20', text: 'text-rose-700 dark:text-rose-400', title: 'text-rose-950 dark:text-rose-100', tagBg: 'bg-rose-200/80 dark:bg-rose-900/50', tagText: 'text-rose-800 dark:text-rose-200', tagBorder: 'border-rose-500/10' },
};

function renderGridCard(item, c) {
    const isExt = item.external;
    const linkCls = isExt ? '' : 'app-link';
    const target = isExt ? 'target="_blank"' : '';
    const dataTitle = item.dataTitle ? `data-title="${item.dataTitle}"` : '';
    const tags = (item.tags || []).map(t => {
        const tc = COLOR_MAP[item.color] || COLOR_MAP.emerald;
        return `<span class="text-[10px] ${tc.tagBg} px-2 py-1 rounded ${tc.tagText} uppercase font-bold border ${tc.tagBorder}">${t}</span>`;
    }).join('');
    const ic = COLOR_MAP[item.color] || COLOR_MAP.emerald;
    return `<a href="${item.url}" ${target} class="${linkCls} flex flex-col p-6 glass-card rounded-2xl hover:bg-white/70 dark:hover:bg-white/10 transition-colors group/link" ${dataTitle}>
        <div class="flex items-center justify-between mb-4">
            ${svg(item.icon || 'code', `w-8 h-8 ${ic.text} group-hover/link:scale-110 transition-transform drop-shadow-md`)}
            ${isExt ? svg('external', 'w-4 h-4 text-slate-500 dark:text-slate-400 group-hover/link:text-indigo-600 dark:group-hover/link:text-indigo-400 transition-colors') : ''}
        </div>
        <span class="font-bold text-lg block ${ic.title} mb-2">${item.name}</span>
        <span class="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed mb-4 flex-grow">${item.description}</span>
        <div class="flex gap-2 mt-auto">${tags}</div>
    </a>`;
}

function renderListItem(item, c) {
    const cls = item.external || item.isPdf ? '' : 'app-link';
    const target = item.external || item.isPdf ? 'target="_blank"' : '';
    const dataTitle = item.dataTitle ? `data-title="${item.dataTitle}"` : '';
    const cc = COLOR_MAP[c] || COLOR_MAP.emerald;

    if (item.isPdf) {
        return `<a href="${item.url}" ${target} class="flex items-center justify-between p-4 glass-card rounded-xl hover:bg-white/70 dark:hover:bg-white/10 transition-colors mt-2 border-dashed !border-${c}-500/30">
            <div class="flex items-center gap-3">
                ${svg('document', `w-5 h-5 text-${c}-600 dark:text-${c}-400 drop-shadow-sm`)}
                <div><span class="font-bold text-sm block ${cc.title}">${item.name}</span><span class="text-xs text-slate-700 dark:text-slate-400 font-medium">${item.description}</span></div>
            </div>
            ${svg('external', 'w-4 h-4 text-slate-400')}
        </a>`;
    }

    let subHtml = '';
    if (item.subItems) {
        subHtml = `<div class="pl-4 border-l-2 border-slate-400/30 dark:border-white/20 space-y-2 ml-4 mb-4">
            ${item.subItems.map(s => `<a href="${s.url}" class="app-link flex items-center gap-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors font-medium" data-title="${s.dataTitle}">
                ${svg(s.icon || 'code', 'w-4 h-4 shrink-0 drop-shadow-sm')} <span>${s.name}</span>
            </a>`).join('')}
        </div>`;
    }

    return `<a href="${item.url}" class="${cls} flex items-center justify-between p-4 glass-card rounded-xl hover:bg-white/70 dark:hover:bg-white/10 transition-colors" ${dataTitle}>
        <div><span class="font-bold text-sm block ${cc.title}">${item.name}</span><span class="text-xs text-slate-700 dark:text-slate-400 font-medium">${item.description}</span></div>
        <span class="text-[10px] bg-slate-200/80 dark:bg-slate-800/80 px-2 py-1 rounded text-slate-700 dark:text-slate-300 uppercase font-bold border border-black/5 dark:border-white/5">${item.tag || ''}</span>
    </a>${subHtml}`;
}

function renderCategory(cat) {
    const cc = COLOR_MAP[cat.color] || COLOR_MAP.emerald;
    const fw = cat.fullWidth ? 'lg:col-span-2' : '';
    const mt = cat.id === 'mini-projects' ? 'mt-8' : '';
    const open = cat.defaultOpen ? 'open' : '';

    let indexBtn = '';
    if (cat.indexUrl) {
        indexBtn = `<a href="${cat.indexUrl}" target="_blank" onclick="event.stopPropagation();" class="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/40 dark:bg-black/20 border border-white/50 dark:border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10 transition-colors shadow-sm">
            Index ${svg('external', 'w-3 h-3')}
        </a>`;
    }

    let itemsHtml;
    if (cat.layout === 'grid') {
        const visible = cat.items.filter(i => !i.hidden);
        const hidden = cat.items.filter(i => i.hidden);
        itemsHtml = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 animate-fadeIn" ${cat.id === 'mini-projects' ? 'id="mini-projects-grid"' : ''}>
            ${visible.map(i => renderGridCard(i, cat.color)).join('')}
            ${hidden.map(i => `<a href="${i.url}" class="app-link extra-mini hidden flex-col p-6 glass-card rounded-2xl hover:bg-white/70 dark:hover:bg-white/10 transition-colors group/link" data-title="${i.dataTitle}">
                <div class="flex items-center justify-between mb-4">${svg(i.icon || 'code', `w-8 h-8 ${(COLOR_MAP[i.color]||COLOR_MAP.emerald).text} group-hover/link:scale-110 transition-transform drop-shadow-md`)}</div>
                <span class="font-bold text-lg block ${(COLOR_MAP[i.color]||COLOR_MAP.emerald).title} mb-2">${i.name}</span>
                <span class="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed mb-4 flex-grow">${i.description}</span>
                <div class="flex gap-2 mt-auto">${(i.tags||[]).map(t=>`<span class="text-[10px] ${(COLOR_MAP[i.color]||COLOR_MAP.emerald).tagBg} px-2 py-1 rounded ${(COLOR_MAP[i.color]||COLOR_MAP.emerald).tagText} uppercase font-bold border ${(COLOR_MAP[i.color]||COLOR_MAP.emerald).tagBorder}">${t}</span>`).join('')}</div>
            </a>`).join('')}
        </div>`;
        if (hidden.length > 0) {
            itemsHtml += `<div class="mt-12 flex justify-center" id="load-more-container">
                <button id="load-more-btn" class="px-8 py-3 glass-card hover:bg-white/80 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-full transition-all font-bold flex items-center gap-2 group/btn border border-white/40 dark:border-white/10 shadow-lg">
                    Load More Projects ${svg('chevron', 'w-4 h-4 transition-transform group-hover/btn:translate-y-0.5')}
                </button>
            </div>`;
        }
    } else {
        itemsHtml = `<div class="space-y-3 mt-8 animate-fadeIn">${cat.items.map(i => renderListItem(i, cat.color)).join('')}</div>`;
    }

    return `<div class="p-6 sm:p-10 glass-panel rounded-[2.5rem] ${cc.hover} transition-colors group ${fw} ${mt}">
        <details class="group/details" ${open}>
            <summary class="flex items-center justify-between cursor-pointer outline-none select-none">
                <div class="flex items-center gap-4">
                    <div class="p-4 ${cc.bg} ${cc.text} rounded-2xl group-hover:scale-110 transition-transform shadow-sm">${svg(cat.icon, 'w-6 h-6')}</div>
                    <div><h3 class="text-2xl font-bold text-slate-900 dark:text-white drop-shadow-sm">${cat.name}</h3><p class="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">${cat.description}</p></div>
                </div>
                <div class="flex items-center gap-3 ml-4 shrink-0">
                    ${indexBtn}
                    <div class="p-2 bg-white/40 dark:bg-black/20 border border-white/50 dark:border-white/10 rounded-full hover:bg-white/60 dark:hover:bg-white/10 transition-colors shadow-sm">
                        ${svg('chevron', 'w-5 h-5 text-slate-700 dark:text-slate-300 transition-transform duration-300 group-open/details:rotate-180')}
                    </div>
                </div>
            </summary>
            ${itemsHtml}
        </details>
    </div>`;
}

function renderContactCard(ch) {
    const colorMap = { emerald: 'emerald', red: 'red', blue: 'blue', pink: 'pink', slate: 'slate-800', indigo: 'indigo-600' };
    const hoverBorder = `hover:border-${ch.color}-500/50 dark:hover:border-${ch.color}-500/50`;
    const hoverText = ch.color === 'slate' ? 'group-hover:text-black dark:group-hover:text-slate-300' : `group-hover:text-${ch.color}-700 dark:group-hover:text-${ch.color}-400`;
    const isFilled = ['github','instagram','twitter','facebook'].includes(ch.icon);
    const iconColor = ch.color === 'slate' ? 'text-slate-800 dark:text-slate-200' : `text-${ch.color}-600 dark:text-${ch.color}-400`;
    return `<a href="${ch.url}" target="_blank" class="p-6 glass-panel ${hoverBorder} transition-all group flex items-center justify-between rounded-[2rem]">
        <div><p class="text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">${ch.platform}</p>
        <p class="font-bold text-sm text-slate-900 dark:text-white ${hoverText} transition-colors truncate">${ch.handle}</p></div>
        <svg class="w-6 h-6 ${iconColor} opacity-40 group-hover:opacity-100 transition-opacity drop-shadow-md shrink-0 ml-3" ${isFilled ? 'fill="currentColor"' : 'fill="none" stroke="currentColor"'} viewBox="0 0 24 24">${ICONS[ch.icon]||''}</svg>
    </a>`;
}

function renderResume(data) {
    const p = data.profile;
    const r = data.resume;
    const socials = p.socialLinks.map(s => {
        const isFilled = ['github','instagram','twitter','facebook'].includes(s.platform);
        const scColor = s.platform === 'github' ? 'text-slate-700 dark:text-slate-300' : s.platform === 'instagram' ? 'text-pink-600 dark:text-pink-400' : s.platform === 'twitter' ? 'text-slate-800 dark:text-slate-200' : 'text-indigo-600 dark:text-indigo-400';
        return `<a href="${s.url}" target="_blank" class="p-2 bg-white/50 dark:bg-white/5 border border-white/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/20 rounded-full transition-colors ${scColor}">${svg(s.platform, 'w-5 h-5', true)}</a>`;
    }).join('');

    const projects = r.featuredProjects.map(proj => {
        const cc = COLOR_MAP[proj.color] || COLOR_MAP.indigo;
        return `<a href="${proj.url}" target="_blank" class="flex flex-col p-6 glass-card rounded-2xl hover:bg-white/70 dark:hover:bg-white/10 transition-colors group/link border border-white/40 dark:border-white/5">
            <span class="font-bold text-lg block ${cc.title} mb-1">${proj.name}</span>
            <span class="text-sm text-slate-600 dark:text-slate-400 font-medium mb-4 flex-grow">${proj.description}</span>
            <span class="text-[10px] w-fit ${cc.tagBg} px-2 py-1 rounded ${cc.tagText} uppercase font-bold border ${cc.tagBorder}">${proj.tag}</span>
        </a>`;
    }).join('');

    return `<div class="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-10 border-b border-black/10 dark:border-white/10 pb-10">
        <img src="${p.avatar}" alt="${p.name}" class="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl object-cover shadow-xl border-4 border-white/40 dark:border-white/10 shrink-0">
        <div class="text-center sm:text-left flex-grow">
            <h2 class="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-2 tracking-tight drop-shadow-sm">${p.name}</h2>
            <p class="text-lg sm:text-xl text-emerald-600 dark:text-emerald-400 font-bold mb-4 drop-shadow-sm">${p.title}</p>
            <div class="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-4 text-sm text-slate-700 dark:text-slate-300 font-medium mb-6">
                <span class="flex items-center gap-1.5 bg-white/40 dark:bg-black/20 px-3 py-1.5 rounded-full border border-white/50 dark:border-white/5 shadow-sm">${svg('location', 'w-4 h-4')} ${p.location}</span>
                <span class="flex items-center gap-1.5 bg-white/40 dark:bg-black/20 px-3 py-1.5 rounded-full border border-white/50 dark:border-white/5 shadow-sm">${svg('mail', 'w-4 h-4')} ${p.email}</span>
            </div>
            <div class="flex items-center justify-center sm:justify-start gap-3">${socials}</div>
        </div>
    </div>
    <div class="mb-10">
        <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3 drop-shadow-sm">
            <div class="p-2 bg-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400">${svg('education', 'w-5 h-5')}</div> Education
        </h3>
        <div class="glass-card p-6 sm:p-8 rounded-3xl border border-white/50 dark:border-white/10 relative overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <h4 class="text-xl font-bold text-slate-900 dark:text-white">${r.education.degree}</h4>
            <p class="text-slate-600 dark:text-slate-400 mt-2 font-medium">${r.education.description}</p>
        </div>
    </div>
    <div>
        <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3 drop-shadow-sm">
            <div class="p-2 bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400">${svg('briefcase', 'w-5 h-5')}</div> Featured Open Source
        </h3>
        <div class="grid sm:grid-cols-2 gap-4">${projects}</div>
    </div>`;
}

// === INLINE DATA ===
const DATA = {
  "meta": {
    "title": "Atish Ak Sharma - Official Portfolio",
    "description": "Official portfolio of Atish Ak Sharma. A developer's garden of experiments, tools, and research. Documenting the journey of ATS Design Studio.",
    "keywords": "Atish Ak Sharma, ATS Design Studio, Portfolio, Web Developer, Full Stack, Experimental UI, Web Design, Personal Vault",
    "author": "Atish Ak Sharma",
    "canonical": "https://atishaksharma.com/",
    "ogImage": "https://pbs.twimg.com/profile_images/1530184439409815553/stAtZvyp_400x400.jpg",
    "favicon": "https://pbs.twimg.com/profile_images/1530184439409815553/stAtZvyp_400x400.jpg"
  },
  "profile": {
    "name": "Atish Sharma",
    "displayName": "Atish Ak Sharma",
    "title": "Full Stack Developer & Creative Technologist",
    "avatar": "https://pbs.twimg.com/profile_images/1530184439409815553/stAtZvyp_400x400.jpg",
    "location": "Chandigarh, India",
    "email": "mail@atishaksharma.com",
    "studio": "Ats Design Studio",
    "socialLinks": [
      { "platform": "github", "url": "https://github.com/atishsharma", "handle": "@atishsharma" },
      { "platform": "instagram", "url": "https://instagram.com/atishaksharma", "handle": "@atishaksharma" },
      { "platform": "twitter", "url": "https://twitter.com/atishaksharma", "handle": "@atishaksharma" },
      { "platform": "facebook", "url": "https://facebook.com/atishaksharma", "handle": "@atishaksharma" }
    ]
  },
  "resume": {
    "education": {
      "degree": "M.Tech Computer Science and Technology",
      "description": "Advanced specialization in software engineering, system architecture, and modern computing technologies."
    },
    "featuredProjects": [
      { "name": "AT Music Player", "url": "https://github.com/atishsharma/AT-Music-Player", "description": "A feature-rich, open-source audio platform.", "tag": "Audio App", "color": "indigo" },
      { "name": "Tulip File Explorer", "url": "https://github.com/atishsharma/Tulip-File-Explorer", "description": "Cross-platform file management utility.", "tag": "System Tool", "color": "blue" },
      { "name": "Hindu Calendar Widget", "url": "https://github.com/atishsharma/ats-hindu-calendar-widget", "description": "Desktop widget for tracking dates and events.", "tag": "Desktop Widget", "color": "orange" },
      { "name": "Ember Studio", "url": "https://atishaksharma.com/ember/", "description": "Brand identity and market positioning logic.", "tag": "Design/Strategy", "color": "rose" }
    ]
  },
  "hero": {
    "badge": "© Ats Design Studio",
    "heading": ["Welcome To My", "Portfolio"],
    "description": "A developer's garden of <strong>experiments, tools, and research</strong>. Documenting the journey of ATS Design Studio.",
    "ctaPrimary": { "text": "Explore Portfolio", "href": "#portfolio" },
    "ctaSecondary": { "text": "Direct Contact", "href": "#contact" }
  },
  "portfolio": {
    "title": "Portfolio Access.",
    "subtitle": "Categorized access to all internal tools, system redesigns, and research modules.",
    "cta": "Just Click And View Inside.",
    "categories": [
      {
        "id": "open-source", "name": "Open Source Projects", "description": "Major software applications and open-source contributions.",
        "color": "indigo", "icon": "code", "defaultOpen": true, "fullWidth": true, "layout": "grid",
        "items": [
          { "name": "AT Music Player", "url": "https://github.com/atishsharma/AT-Music-Player", "description": "A feature-rich, open-source music player project.", "external": true, "icon": "music", "color": "indigo", "tags": ["App", "Audio"] },
          { "name": "Tulip File Explorer", "url": "https://github.com/atishsharma/Tulip-File-Explorer", "description": "An open-source, cross-platform file management utility.", "external": true, "icon": "folder", "color": "blue", "tags": ["Utility", "System"] },
          { "name": "Hindu Calendar Widget", "url": "https://github.com/atishsharma/ats-hindu-calendar-widget", "description": "A cross-platform desktop widget for tracking dates and events.", "external": true, "icon": "calendar", "color": "orange", "tags": ["Widget", "Desktop"] }
        ]
      },
      {
        "id": "experimental-labs", "name": "Experimental Labs", "description": "Hardware simulations & research prototypes.",
        "color": "emerald", "icon": "flask", "defaultOpen": false, "fullWidth": false, "layout": "list",
        "items": [
          { "name": "Testing Grounds (Main)", "url": "https://atishaksharma.com/testing/", "description": "Root hub for hardware interfaces.", "tag": "Index", "dataTitle": "Testing Grounds",
            "subItems": [
              { "name": "Camera Sim", "url": "https://atishaksharma.com/testing/camera.html", "icon": "camera", "dataTitle": "Camera Sim" },
              { "name": "Chip Logic", "url": "https://atishaksharma.com/testing/chip.html", "icon": "chip", "dataTitle": "Chip Logic" },
              { "name": "Fold Interaction", "url": "https://atishaksharma.com/testing/fold.html", "icon": "fold", "dataTitle": "Fold Interaction" },
              { "name": "Laptop & Desktop", "url": "https://atishaksharma.com/testing/laptop.html", "icon": "laptop", "dataTitle": "Laptop & Desktop" },
              { "name": "Smartphone", "url": "https://atishaksharma.com/testing/smartphone.html", "icon": "smartphone", "dataTitle": "Smartphone" }
            ]
          },
          { "name": "The Lab", "url": "https://atishaksharma.com/lab/", "description": "General experimental web API playground.", "tag": "Research", "dataTitle": "The Lab" },
          { "name": "Concept Hub", "url": "https://atishaksharma.com/concept/", "description": "Experimental design concepts.", "tag": "Idea", "dataTitle": "Concept Hub" }
        ]
      },
      {
        "id": "business-research", "name": "Business & Research", "description": "Strategic research and brand feasibility.",
        "color": "orange", "icon": "chart", "defaultOpen": false, "fullWidth": false, "layout": "list",
        "items": [
          { "name": "Ember Core", "url": "https://atishaksharma.com/ember/", "description": "Main hub for Ember project.", "tag": "Index", "dataTitle": "Ember Core" },
          { "name": "Ember Studio", "url": "https://atishaksharma.com/ember/studio/", "description": "Brand identity & visual research.", "tag": "Design", "dataTitle": "Ember Studio" },
          { "name": "Ember Market", "url": "https://atishaksharma.com/ember/market.html", "description": "Feasibility and positioning strategy.", "tag": "Strategy", "dataTitle": "Ember Market" },
          { "name": "Feasibility Report", "url": "https://atishaksharma.com/ember/Scented%20Candle%20Business%20Feasibility%20Report.pdf", "description": "PDF Document Analysis", "external": true, "isPdf": true, "dataTitle": "Feasibility Report" }
        ]
      },
      {
        "id": "personal-utilities", "name": "Personal Utilities", "description": "Internal tools for productivity & organization.",
        "color": "blue", "icon": "code", "defaultOpen": false, "fullWidth": false, "layout": "list",
        "items": [
          { "name": "Personal Hub", "url": "https://atishaksharma.com/hub/", "description": "Personal bookmark manager.", "tag": "PWA", "dataTitle": "Personal Hub" },
          { "name": "Memo Vault", "url": "https://atishaksharma.com/memo/", "description": "Minimalist note-taking & logging.", "tag": "Tools", "dataTitle": "Memo Vault" },
          { "name": "Time Calendar", "url": "https://atishaksharma.com/calendar/", "description": "Custom scheduling & event tracking.", "tag": "App", "dataTitle": "Time Calendar" }
        ]
      },
      {
        "id": "design-systems", "name": "Project Pages", "description": "Dedicated project landing pages and documentation.",
        "color": "purple", "icon": "palette", "defaultOpen": false, "fullWidth": false, "layout": "list",
        "items": [
          { "name": "AT Music Player", "url": "https://atishaksharma.com/atmusic/", "description": "Experimental web music interface.", "tag": "App", "dataTitle": "AT Music Player (Web)" },
          { "name": "Tulip File Explorer", "url": "https://atishaksharma.com/tulip/", "description": "Landing page for the cross-platform file management utility.", "tag": "Layout", "dataTitle": "Tulip File Explorer" },
          { "name": "Core1987 Remote", "url": "https://atishaksharma.com/core1987remote/", "description": "Nostalgic interface for management.", "tag": "Legacy", "dataTitle": "Core1987 Remote" }
        ]
      },
      {
        "id": "mini-projects", "name": "Mini Projects", "description": "Quick tools, data visualizations, and bite-sized experiments.",
        "color": "emerald", "icon": "cube", "defaultOpen": true, "fullWidth": true, "layout": "grid",
        "indexUrl": "https://atishaksharma.com/minis/",
        "items": [
          { "name": "Indian Expressways", "url": "https://atishaksharma.com/minis/expressways.html", "description": "Interactive visualization of the Indian Expressway network.", "icon": "map-flag", "color": "emerald", "tags": ["DataViz"], "dataTitle": "Indian Expressways" },
          { "name": "Indian Highways", "url": "https://atishaksharma.com/minis/indianhighways.html", "description": "Detailed map view of National Highways across India.", "icon": "map-pin", "color": "blue", "tags": ["Map"], "dataTitle": "Indian Highways" },
          { "name": "GeoMap JS", "url": "https://atishaksharma.com/minis/geomap.html", "description": "A lightweight JavaScript utility for geographical mapping.", "icon": "globe", "color": "orange", "tags": ["Library"], "dataTitle": "GeoMap JS" },
          { "name": "Packager", "url": "https://atishaksharma.com/minis/packager.html", "description": "Small utility for resource bundling and organization.", "icon": "package", "color": "indigo", "tags": ["Tool"], "dataTitle": "Packager Tool", "hidden": true },
          { "name": "Loadbox", "url": "https://atishaksharma.com/minis/loadbox.html", "description": "UI loading state simulator and animation playground.", "icon": "refresh", "color": "rose", "tags": ["UI/UX"], "dataTitle": "Loadbox Sim", "hidden": true }
        ]
      }
    ]
  },
  "contact": {
    "title": "Direct Communication",
    "subtitle": "Connect with me across the web @atishaksharma",
    "channels": [
      { "platform": "Official Email", "handle": "mail@atishaksharma.com", "url": "mailto:mail@atishaksharma.com", "color": "emerald", "icon": "mail" },
      { "platform": "Google Mail", "handle": "@atishaksharma", "url": "mailto:atishaksharma@gmail.com", "color": "red", "icon": "gmail" },
      { "platform": "GitHub", "handle": "@atishsharma", "url": "https://github.com/atishsharma", "color": "blue", "icon": "github" },
      { "platform": "Instagram", "handle": "@atishaksharma", "url": "https://instagram.com/atishaksharma", "color": "pink", "icon": "instagram" },
      { "platform": "Twitter / X", "handle": "@atishaksharma", "url": "https://twitter.com/atishaksharma", "color": "slate", "icon": "twitter" },
      { "platform": "Facebook", "handle": "@atishaksharma", "url": "https://facebook.com/atishaksharma", "color": "indigo", "icon": "facebook" }
    ]
  },
  "footer": { "text": "All The Rights Reserved By Atish Ak Sharma" },
  "nav": {
    "links": [
      { "text": "Home", "href": "#home" },
      { "text": "Portfolio", "href": "#portfolio" },
      { "text": "Contact", "href": "#contact" }
    ],
    "github": "https://github.com/atishsharma"
  }
};

// === MAIN LOADER ===
function loadData() {
    const data = DATA;

    // Nav
    document.getElementById('nav-logo').src = data.profile.avatar;
    document.getElementById('nav-name-desktop').textContent = data.profile.displayName;
    document.getElementById('nav-name-mobile').textContent = data.profile.displayName;
    document.getElementById('nav-github').href = data.nav.github;
    document.getElementById('nav-links').innerHTML = data.nav.links.map(l => `<a href="${l.href}" class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors drop-shadow-sm">${l.text}</a>`).join('');

    // Hero - Name Background (one line on desktop, hidden on mobile)
    document.getElementById('hero-name-bg').textContent = 'Atish Ak Sharma';

    // Hero - Name Mobile (3 lines: Atish / Ak / Sharma)
    document.getElementById('hero-name-mobile-container').innerHTML = `<span>Atish</span><span>Ak</span><span>Sharma</span>`;

    // Hero - Photo (using heroimage.png)
    document.getElementById('hero-photo-container').innerHTML = `<img src="heroimage.png" alt="${data.profile.displayName}">`;

    // Hero - Left Content
    document.getElementById('hero-left').innerHTML = `
        <p class="text-[11px] font-bold text-red-500 dark:text-red-400 uppercase tracking-widest mb-4 border border-red-500 dark:border-red-400 rounded-full px-4 py-1.5 inline-block">${data.hero.badge}</p>
        <h2 class="text-4xl md:text-5xl font-black font-['Anton'] tracking-wide text-slate-800 dark:text-slate-100 leading-tight mb-6 drop-shadow-md uppercase">Welcome To My<br/><span class="gradient-text drop-shadow-sm">Portfolio</span></h2>
        <a href="#portfolio" class="hero-scroll-btn inline-flex" aria-label="Scroll to Portfolio">
            <span>Explore Portfolio</span>
            <div class="hero-scroll-icon">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
            </div>
        </a>`;

    // Hero - Right Content
    document.getElementById('hero-right').innerHTML = `
        <p>A developer's garden of experiments, tools, and research. Documenting the journey of ATS Design Studio.</p>
        <a href="${data.hero.ctaSecondary.href}" class="hero-cta">
            <span>Direct Communication</span>
            <span class="hero-cta-arrow"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M7 17L17 7M17 7H7M17 7V17"></path></svg></span>
        </a>`;



    // Portfolio Grid
    document.getElementById('portfolio-grid').innerHTML = data.portfolio.categories.map(renderCategory).join('');

    // Contact
    document.getElementById('contact-content').innerHTML = `
        <div class="space-y-4">
            <h2 class="text-4xl font-black text-slate-900 dark:text-white drop-shadow-sm">${data.contact.title}</h2>
            <p class="text-slate-700 dark:text-slate-300 font-medium drop-shadow-sm">${data.contact.subtitle}</p>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">${data.contact.channels.map(renderContactCard).join('')}</div>`;

    // Footer
    document.getElementById('footer-text').innerHTML = `&copy; <span>${new Date().getFullYear()}</span> ${data.footer.text}`;

    // Resume
    document.getElementById('resume-body').innerHTML = renderResume(data);

    // Init behaviors after render
    initBehaviors();
}

function initBehaviors() {
    // Theme Toggle
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
    const themeToggleBtn = document.getElementById('theme-toggle');

    function updateThemeIcons() {
        if (document.documentElement.classList.contains('dark')) {
            themeToggleLightIcon.classList.remove('hidden');
            themeToggleDarkIcon.classList.add('hidden');
        } else {
            themeToggleDarkIcon.classList.remove('hidden');
            themeToggleLightIcon.classList.add('hidden');
        }
    }
    updateThemeIcons();
    themeToggleBtn.addEventListener('click', function () {
        document.documentElement.classList.toggle('dark');
        localStorage.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        updateThemeIcons();
    });

    // App Viewer
    const viewer = document.getElementById('app-viewer');
    const frame = document.getElementById('viewer-frame');
    const closeBtn = document.getElementById('close-viewer');
    const viewerTitle = document.getElementById('viewer-title');
    const extLinkBtn = document.getElementById('viewer-external-link');

    document.querySelectorAll('.app-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const url = link.href;
            if (url.startsWith('mailto:') || url.startsWith('#')) return;
            try {
                const linkUrl = new URL(url, window.location.href);
                if (linkUrl.hostname !== window.location.hostname && linkUrl.hostname !== 'atishaksharma.com' && linkUrl.hostname !== '') {
                    e.preventDefault(); window.open(url, '_blank'); return;
                }
            } catch (err) { }
            e.preventDefault();
            let titleText = link.getAttribute('data-title') || link.querySelector('.font-bold')?.textContent || 'Preview';
            viewerTitle.textContent = titleText;
            frame.src = url;
            extLinkBtn.href = url;
            viewer.classList.remove('hidden');
            setTimeout(() => viewer.classList.remove('opacity-0'), 10);
            document.body.style.overflow = 'hidden';
        });
    });

    closeBtn.addEventListener('click', () => {
        viewer.classList.add('opacity-0');
        setTimeout(() => { viewer.classList.add('hidden'); frame.src = ''; document.body.style.overflow = ''; }, 300);
    });

    // Resume Modal
    const resumeModal = document.getElementById('resume-modal');
    const openResumeBtn = document.getElementById('open-resume');
    const closeResumeBtn = document.getElementById('close-resume');
    const resumeBackdrop = document.getElementById('resume-backdrop');

    const openResume = (e) => { e.preventDefault(); resumeModal.classList.remove('hidden'); setTimeout(() => resumeModal.classList.remove('opacity-0'), 10); document.body.style.overflow = 'hidden'; };
    const closeResume = () => { resumeModal.classList.add('opacity-0'); setTimeout(() => { resumeModal.classList.add('hidden'); document.body.style.overflow = ''; }, 300); };

    if (openResumeBtn) openResumeBtn.addEventListener('click', openResume);
    if (closeResumeBtn) closeResumeBtn.addEventListener('click', closeResume);
    if (resumeBackdrop) resumeBackdrop.addEventListener('click', closeResume);

    // Load More
    const loadMoreBtn = document.getElementById('load-more-btn');
    const extraMinis = document.querySelectorAll('.extra-mini');
    const loadMoreContainer = document.getElementById('load-more-container');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            extraMinis.forEach(item => { item.classList.remove('hidden'); item.classList.add('animate-fadeIn'); });
            loadMoreContainer.classList.add('hidden');
        });
    }
}

document.addEventListener('DOMContentLoaded', loadData);
