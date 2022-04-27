import { ConfigureUI } from '@/configure/ConfigureUI';
import { DisplayWebGlEventBus } from '@/configure/ui/configureui-components';
import { setAddToCartButtonStatus } from './add-to-cart';

export async function createWebGLDisplay(configure: ConfigureUI, container: string): Promise<void> {
  try {
    document.body.classList.add('is-webgl');
    const displayWebgl = await configure.createComponent({
      type: 'displayWebgl',
      container,
      webglOverrides: { scene: { background: '#f8f8f8' } }
    });
    initDisplayWebGL(displayWebgl);
  } catch (err) {
    document.body.classList.remove('is-webgl');
    throw err;
  }
}

function initDisplayWebGL(displayWebgl: DisplayWebGlEventBus) {
  displayWebgl.on('display:webgl:load-progress', function (progress) {
    handleWebglLoadProgress(progress);
    if (progress === 100) {
      setAddToCartButtonStatus(true);
      window.dispatchEvent(new Event('resize'));
    } else {
      setAddToCartButtonStatus(false);
    }
  });

  /*
  displayWebgl.on('all', function (type, data) {
    if (type !== 'display:webgl:mesh:hover') console.log(type, data);
  });
  */

  addARSupport(displayWebgl);

  addFullScreenSupport(displayWebgl);
}

function addARSupport(displayWebgl: DisplayWebGlEventBus) {
  let arLink: HTMLAnchorElement | undefined;
  displayWebgl.on('display:webgl:usdzModelExportReady', function (fileURL) {
    if (!arLink) {
      arLink = document.createElement('a');
      const img = document.createElement('img');
      document.body.appendChild(arLink);
      img.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>";
      arLink.rel = 'ar';
      arLink.download = 'model.usdz';
      arLink.style.display = 'none';
      arLink.appendChild(img);
    }
    arLink.href = fileURL;
    arLink.click();
  });

  const arButton: HTMLButtonElement | null = document.querySelector('.configure-ar-btn');
  if (arButton) {
    const arSupport = window.location.href.indexOf('ar=true') > 0 && false; //isARSupported();
    if (arSupport) {
      arButton.addEventListener('click', () => displayWebgl.trigger('display:webgl:exportToUsdz'));
    } else {
      arButton.style.display = 'none';
    }
  }
}

function addFullScreenSupport(displayWebgl: DisplayWebGlEventBus) {
  document.querySelector('.configure-full-screen-btn')?.addEventListener('click', toggleFullScreen);

  function handleEscFullScreen(e: KeyboardEvent) {
    if (e.key === 'Escape') toggleFullScreen();
  }

  function toggleFullScreen() {
    const containerWrapper = document.querySelector('.configure-container-wrap');
    if (!containerWrapper) return;

    containerWrapper.classList.toggle('full-screen-on');
    if (containerWrapper.classList.contains('full-screen-on')) {
      document.addEventListener('keydown', handleEscFullScreen);
    } else {
      document.removeEventListener('keydown', handleEscFullScreen);
    }
    displayWebgl.trigger('display:webgl:resizeCanvas');
  }
}

function handleWebglLoadProgress(progress: number) {
  const wrapper: HTMLElement | null = document.querySelector('.webgl-loader-wrapper');
  const content: HTMLElement | null = document.querySelector('.webgl-loader-content');
  const circle: SVGElement | null = document.querySelector('.webgl-loader-bar');

  if (isNaN(progress)) progress = 100;
  if (!circle) return;

  const r = Number(circle.getAttribute('r') ?? 0);
  const c = Math.PI * (r * 2);

  progress = Math.min(Math.max(progress, 0), 100);

  const pct = ((100 - progress) / 100) * c;

  circle.style.strokeDashoffset = '' + pct;

  if (content) content.setAttribute('data-pct', '' + progress);

  if (wrapper && progress === 100) wrapper.classList.add('loaded');
}
