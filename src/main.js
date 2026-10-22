import { Game } from './game.js';
import { render } from './render.js';

const root=document.querySelector('#app');
const game=new Game(state=>render(root,game));
render(root,game);
