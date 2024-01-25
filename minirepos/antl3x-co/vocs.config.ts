import { defineConfig } from 'vocs';
import tsconfigPaths from 'vite-tsconfig-paths' 

export default defineConfig({
  vite: {
    plugins: [tsconfigPaths({
      root: __dirname,
    })] 
  },
  ogImageUrl: {
    '/': '/og-image.png'
  },
  font: {
    google: 'DM Mono'
  },
  title: '@antl3x / webhome',

iconUrl: {
  dark: '/favicon-dark.svg',
  light: '/favicon-light.svg'
},
logoUrl: { 
    
  light: '/logo-light.svg', 
      
  dark: '/logo-dark.svg' 
    }, 
    sidebar: {
      '/': [ 
        { 
          text: 'Welcome', 
          link: '/', 
        }, 
        { 
          text: 'Posts', 
          link: '/posts', 
        }, 
        { 
          text: 'Resume / CV', 
          link: 'https://cv.antl3x.co', 
        }, 
        { 
          text: 'Let\'s Connect', 
          collapsed: false, 
          items: [ 
            { 
              text: 'GitHub', 
              link: 'https://github.com/antl3x', 
            }, 
            { 
              text: 'LinkedIn', 
              link: 'https://linkedin.com/in/antl3x', 
            }, 
            { 
              text: 'X', 
              link: 'https://x.com/antl3x', 
            }, 
          ], 
        } 
      ], 
      '/examples/': [ 
        { text: 'React', link: '/examples/react' } ,
        { text: 'Vue', link: '/examples/vue' }
      ] 
    },
  // topNav: [ 
  //   { text: 'Posts', link: '/posts', match: '/posts' }, 
  // ], 
  theme: {
    accentColor: {
      dark: '#F9BE28',
      light: '#990f3d'	
    },
    variables: {
      color: {
        border: {
            light: '#c6b7aa',
            dark: '#3B3B3B'
        },
        hr: {
          light: '#e6d9ce',
          dark: '#3B3B3B'
        },
        background: {
          light: '#fff1e5',
          dark: '#232225'
        },
        backgroundDark: {
          light: '#f2dfce',
          dark: '#1e1d1f'
        }
      },
      fontFamily: {
        default: 'DM Mono'
      },
      fontSize: {
      root: '14px',
    },
    fontWeight: {
      semibold: '600',
    }
  },
  }
})
