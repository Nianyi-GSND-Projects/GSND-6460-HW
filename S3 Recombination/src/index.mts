import './p5.mts';
import App from './app.mts';

const app = new App();

window.preload = App.prototype.Initialize.bind(app);
window.setup = App.prototype.Start.bind(app);
window.draw = App.prototype.StepFrame.bind(app);