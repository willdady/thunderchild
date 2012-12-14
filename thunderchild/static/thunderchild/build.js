{
    mainConfigFile: 'js_src/common.js',
    dir: 'js',
    removeCombined: true,
    preserveLicenseComments: false,
    paths : {
    	jquery: "empty:"
    },
    modules: [
        {
            name: 'common'
        },
        {
            name: 'categories/Main',
            exclude: ['common']
        },
		{
            name: 'create_edit_entries/Main',
            exclude: ['common']
        },
        {
            name: 'entries/Main',
            exclude: ['common']
        },
        {
            name: 'entry_types/Main',
            exclude: ['common']
        },
        {
            name: 'fields/Main',
            exclude: ['common']
        },
        {
            name: 'login/Main',
            exclude: ['common']
        },
        {
            name: 'media/Main',
            exclude: ['common']
        },
        {
            name: 'media_chooser/Main',
            exclude: ['common']
        },
        {
            name: 'templates/Main',
            exclude: ['common']
        },
    ]
}
