import './globals.css';
export const metadata={title:'KhelaBela',manifest:'/manifest.json'};
export default function L({children}:{children:React.ReactNode}){return(<html lang="en"><body><main className="mx-auto max-w-xl p-4">{children}</main>
<script dangerouslySetInnerHTML={{__html:"if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('/sw.js'))"}}/></body></html>)}
