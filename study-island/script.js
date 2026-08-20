(function () {
  'use strict';

  var THEME_STORAGE_KEY = 'edtech-island-theme';
  var R2_PUBLIC_CDN_URL = 'https://pub-670b98370fe642a2be08ee37cbfd385f.r2.dev';
  var SUPABASE_URL = window.SUPABASE_URL || 'https://qmyrxvtbzlbnvzxypnus.supabase.co';
  var SUPABASE_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFteXJ4dnRiemxibnZ6eHlwbnVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MjA4OTcsImV4cCI6MjA5NTM5Njg5N30.ABvW_oBzXC2Ffxm5ToLh6t4WmdKPdtg9SyfeAE76iJo';
  var DEFAULT_CHAPTER_ID = 'light-shadows';
  var DETAIL_CHAPTER_ORDER = ['light-shadows', 'space-solar'];

  function resolveR2Url(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return R2_PUBLIC_CDN_URL + '/' + url.replace(/^\//, '');
  }

  var AVAILABLE_APPS = {
    'Chapter_experience_L_S.html': true,
    'Shadow_Lab.html': true,
    'quiz.html': true
  };
  var CHAPTERS = {
    'light-shadows': {
      id: 'light-shadows',
      title: 'LIGHT AND SHADOWS',
      description: 'The light and shadow simulation model provides interactive exploration of fundamental optical principles. Visualize the formation of complex shadow patterns, examine umbra and penumbra regions, and observe how light propagates to form shadows based on object shape and distance.',
      iconClass: 'ph ph-lightbulb',
      sceneKey: 'lightShadows',
      experienceUrl: 'Chapter_experience_L_S.html',
      quizReady: true,
      contentReady: true,
      experiments_list: [
        {
          id: 'exp_1',
          title: 'Shadow Lab',
          author: 'by Platform',
          badge: 'Latest!',
          likes: '50k',
          icon: '🌕',
          gradient: 'linear-gradient(135deg, #00F0FF, #0070F3)',
          color: '#00F0FF',
          url: 'Shadow_Lab.html'
        }
      ],
      stories_list: [
        {
          id: 'story_1',
          title: 'Shadows and Light Explained',
          tag: 'DOCUMENTARY',
          duration: '5:21',
          description: 'Dive deep into the magical interplay between light sources and opaque objects. A beautifully animated introduction to the science of optics.',
          thumbnail_url: 'https://img.youtube.com/vi/fy7eoMef3e8/hqdefault.jpg',
          url: 'https://www.youtube.com/embed/fy7eoMef3e8?autoplay=1'
        },
        {
          id: 'story_2',
          title: 'The Science of Shadows',
          tag: 'EXPLORE',
          duration: '3:36',
          description: 'Learn how different light angles and intensities stretch and morph shadows, uncovering the geometry behind visual perception.',
          thumbnail_url: 'https://img.youtube.com/vi/4vUozykivNA/hqdefault.jpg',
          url: 'https://www.youtube.com/embed/4vUozykivNA?autoplay=1'
        },
        {
          id: 'story_3',
          title: 'Light & Optics in Real Life',
          tag: 'LESSON',
          duration: '3:58',
          description: 'Discover optical phenomena in nature, camera lenses, and everyday technology.',
          thumbnail_url: 'https://img.youtube.com/vi/cDaWohR_DVo/hqdefault.jpg',
          url: 'https://www.youtube.com/embed/cDaWohR_DVo?autoplay=1'
        }
      ]
    },
    'space-solar': {
      id: 'space-solar',
      title: 'SPACE AND SOLAR SYSTEM',
      description: 'The solar system model provides an interactive journey through our cosmic neighbourhood. Explore planetary orbits, understand gravitational forces, and discover the unique characteristics of each planet from the scorching Mercury to the icy realms of Neptune.',
      iconClass: 'ph ph-planet',
      sceneKey: 'solarSystem',
      experienceUrl: '',
      quizReady: false,
      contentReady: false,
      experiments_list: [],
      stories_list: []
    }
  };

  var currentScreenId = 'screen-home';
  var currentChapterId = DEFAULT_CHAPTER_ID;
  var overlayResetTimer = 0;
  var toastHideTimer = 0;
  var FULLSCREEN_OVERLAY_BODY_CLASS = 'fullscreen-overlay-open';
  var sceneAnimationId = 0;
  var sceneRenderer = null;
  var sceneCleanup = null;
  var sceneRoot = null;
  var sceneBootTimer = 0;

  function byId(id) {
    return document.getElementById(id);
  }

  function getChapter(chapterId) {
    return CHAPTERS[chapterId] || CHAPTERS[DEFAULT_CHAPTER_ID];
  }

  function getCurrentChapter() {
    return getChapter(currentChapterId);
  }

  function setThemeButtonLabel() {
    var themeButton = byId('theme-toggle');
    if (!themeButton) {
      return;
    }

    var isPortal = document.body.classList.contains('light-theme');
    themeButton.textContent = isPortal ? 'Theme: Portal UI' : 'Theme: Deep Space';
    themeButton.setAttribute('aria-label', isPortal ? 'Switch to Deep Space theme' : 'Switch to Portal UI theme');
  }

  function saveThemePreference(value) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, value);
    } catch (error) {
      // Ignore storage failures in restricted browser contexts.
    }
  }

  function applySavedTheme() {
    var storedTheme = '';

    try {
      storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) || '';
    } catch (error) {
      storedTheme = '';
    }

    document.body.classList.toggle('light-theme', storedTheme === 'light');
    setThemeButtonLabel();
  }

  function syncFullscreenButton() {
    var fullscreenButton = byId('fullscreen-toggle');
    if (!fullscreenButton) {
      return;
    }

    var inFullscreen = !!document.fullscreenElement;
    var label = inFullscreen ? 'Exit Fullscreen' : 'Fullscreen';
    var iconSpan = fullscreenButton.querySelector('.fullscreen-icon');

    // Update only the text node — preserve the icon <span> inside the button
    if (iconSpan) {
      // Remove existing text nodes, keep the span
      Array.prototype.forEach.call(fullscreenButton.childNodes, function (node) {
        if (node.nodeType === 3) { fullscreenButton.removeChild(node); }
      });
      fullscreenButton.appendChild(document.createTextNode(' ' + label));
    } else {
      fullscreenButton.textContent = label;
    }
    fullscreenButton.setAttribute('aria-label', inFullscreen ? 'Exit fullscreen' : 'Enter fullscreen');
  }

  function ensureToast() {
    var toast = byId('app-toast');

    if (toast) {
      return toast;
    }

    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.style.position = 'fixed';
    toast.style.left = '50%';
    toast.style.bottom = '96px';
    toast.style.transform = 'translateX(-50%) translateY(12px)';
    toast.style.padding = '12px 18px';
    toast.style.borderRadius = '999px';
    toast.style.border = '1px solid rgba(255, 255, 255, 0.18)';
    toast.style.background = 'rgba(8, 15, 28, 0.92)';
    toast.style.backdropFilter = 'blur(14px)';
    toast.style.webkitBackdropFilter = 'blur(14px)';
    toast.style.color = '#f8fafc';
    toast.style.fontSize = '0.95rem';
    toast.style.fontWeight = '600';
    toast.style.letterSpacing = '0.02em';
    toast.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.35)';
    toast.style.opacity = '0';
    toast.style.pointerEvents = 'none';
    toast.style.transition = 'opacity 180ms ease, transform 180ms ease';
    toast.style.zIndex = '1200';
    document.body.appendChild(toast);

    return toast;
  }

  function showToast(message) {
    var toast = ensureToast();

    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';

    window.clearTimeout(toastHideTimer);
    toastHideTimer = window.setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(12px)';
    }, 2600);
  }

  function updateBottomNav(screenId) {
    var activeLabel = 'HOME';
    if (screenId === 'screen-subjects' || screenId === 'screen-chapters' || screenId === 'screen-chapter-detail') {
      activeLabel = 'STUDIES';
    } else if (screenId === 'screen-world') {
      activeLabel = 'WORLD';
    } else if (screenId === 'screen-profile') {
      activeLabel = 'PROFILE';
    }

    Array.prototype.forEach.call(document.querySelectorAll('.nav-btn'), function (button) {
      var label = button.querySelector('.nav-label');
      var isActive = !!label && label.textContent.trim() === activeLabel;
      button.classList.toggle('active', isActive);
    });
  }

  function loadWorldCourses() {
    var gridEl = byId('world-courses-grid');
    if (!gridEl) return;
    gridEl.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #94a3b8;"><span style="font-size: 2rem; display: block; margin-bottom: 12px;">⌛</span>Fetching World Programs from Supabase...</div>';

    fetch(SUPABASE_URL + '/rest/v1/custom_courses?is_published=eq.true&order=display_order', {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
      }
    })
    .then(function(res) { return res.json(); })
    .then(function(courses) {
      if (!Array.isArray(courses) || courses.length === 0) {
        gridEl.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #94a3b8;"><span style="font-size: 3rem; display: block; margin-bottom: 12px;">🌍</span><h3 style="color: white; font-size: 1.2rem; margin-bottom: 8px;">No World Courses Live Yet</h3><p style="font-size: 0.9rem;">Check back soon! Platform administrators are preparing new custom courses.</p></div>';
        return;
      }

      var html = '';
      courses.forEach(function(course) {
        var expMod = (course.modalities || []).find(function(m) { return m.slug === 'experience'; });
        var expUrl = expMod ? (expMod.url || '') : '';
        var color = course.color || '#00E5FF';

        html += '<div class="glass-panel-card" style="background: rgba(13, 20, 36, 0.8); border: 1px solid ' + color + '40; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.3s ease; position: relative; overflow: hidden;">';
        html += '<div style="position: absolute; top: -30px; right: -30px; width: 120px; height: 120px; border-radius: 50%; background: ' + color + '; filter: blur(40px); opacity: 0.25; pointer-events: none;"></div>';
        
        html += '<div>';
        html += '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">';
        html += '<span style="font-size: 2.5rem; background: ' + (course.cover_gradient || 'rgba(255,255,255,0.05)') + '; width: 60px; height: 60px; border-radius: 16px; display: flex; align-items: center; justify-content: center; border: 1px solid ' + color + '40;">' + (course.emoji || '🌍') + '</span>';
        html += '<span style="font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; text-transform: uppercase; background: ' + color + '20; color: ' + color + '; border: 1px solid ' + color + '50;">' + (course.category || 'Special') + '</span>';
        html += '</div>';

        html += '<h3 style="font-size: 1.3rem; font-weight: 800; color: white; margin: 0 0 8px 0;">' + course.title + '</h3>';
        html += '<p style="font-size: 0.88rem; color: #94a3b8; line-height: 1.5; margin: 0 0 20px 0;">' + (course.tagline || '') + '</p>';
        html += '</div>';

        html += '<div style="display: flex; gap: 10px; align-items: center; margin-top: auto; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.08);">';
        if (expUrl) {
          html += '<button onclick="openAppOverlay(\'' + expUrl + '\', \'fullscreen\')" style="flex: 1; padding: 12px; border-radius: 14px; background: linear-gradient(135deg, ' + color + ', #3B82F6); color: #000; font-weight: 800; font-size: 0.95rem; border: none; cursor: pointer; box-shadow: 0 0 20px ' + color + '40; display: flex; align-items: center; justify-content: center; gap: 8px;">▶ Launch Experience</button>';
        } else {
          html += '<button disabled style="flex: 1; padding: 12px; border-radius: 14px; background: rgba(255,255,255,0.05); color: #64748b; font-weight: 700; font-size: 0.9rem; border: 1px solid rgba(255,255,255,0.1); cursor: not-allowed;">⌛ Content Coming Soon</button>';
        }
        html += '</div>';

        html += '</div>';
      });

      gridEl.innerHTML = html;
    })
    .catch(function(err) {
      gridEl.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #f87171;">Failed to load courses. Please check connection.</div>';
    });
  }

  function activateTab(tabName) {
    Array.prototype.forEach.call(document.querySelectorAll('.sol-tab'), function (button) {
      var isActive = button.getAttribute('data-tab') === tabName;
      button.classList.toggle('active-tab', isActive);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    Array.prototype.forEach.call(document.querySelectorAll('.sol-tab-panel'), function (panel) {
      panel.classList.toggle('active', panel.id === 'tabpanel-' + tabName);
    });

    if (tabName === 'experience') {
      window.setTimeout(function () {
        window.dispatchEvent(new Event('resize'));
        if (currentScreenId === 'screen-chapter-detail') {
          scheduleChapterSceneBoot();
        }
      }, 10);
    } else if (tabName === 'experiments') {
      window.setTimeout(function () {
        if (typeof updateCarouselArrows === 'function') {
          updateCarouselArrows();
        }
      }, 30);
    }
  }

  function disposeSceneGraph(root) {
    if (!root) {
      return;
    }

    if (typeof window.disposeThreeObject === 'function') {
      window.disposeThreeObject(root);
      return;
    }

    if (!root.traverse) {
      return;
    }

    root.traverse(function (object) {
      var materials;

      if (object.geometry && typeof object.geometry.dispose === 'function') {
        object.geometry.dispose();
      }

      if (!object.material) {
        return;
      }

      materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach(function (material) {
        Object.keys(material).forEach(function (key) {
          if (material[key] && typeof material[key].dispose === 'function') {
            material[key].dispose();
          }
        });

        if (typeof material.dispose === 'function') {
          material.dispose();
        }
      });
    });
  }

  function destroyChapterScene() {
    var canvasContainer = byId('canvas-container');

    if (sceneAnimationId) {
      window.cancelAnimationFrame(sceneAnimationId);
      sceneAnimationId = 0;
    }

    if (sceneCleanup) {
      sceneCleanup();
      sceneCleanup = null;
    }

    disposeSceneGraph(sceneRoot);
    sceneRoot = null;

    if (sceneRenderer) {
      sceneRenderer.dispose();
      if (typeof sceneRenderer.forceContextLoss === 'function') {
        sceneRenderer.forceContextLoss();
      }
      sceneRenderer = null;
    }

    if (canvasContainer) {
      canvasContainer.innerHTML = '';
    }
  }

  function makeGlowTexture(innerColor, outerColor) {
    var canvas = document.createElement('canvas');
    var context;
    var gradient;

    canvas.width = 128;
    canvas.height = 128;
    context = canvas.getContext('2d');
    gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, innerColor || 'rgba(255,255,255,1)');
    gradient.addColorStop(0.25, 'rgba(210,240,255,0.85)');
    gradient.addColorStop(0.55, 'rgba(140,200,255,0.35)');
    gradient.addColorStop(1, outerColor || 'rgba(100,200,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);

    return new THREE.CanvasTexture(canvas);
  }

  function addDragRotate(container, target, sensitivityX, sensitivityY) {
    var drag = false;
    var last = { x: 0, y: 0 };
    var sx = sensitivityX || 0.006;
    var sy = sensitivityY || 0.003;

    function start(event) {
      var point = event.touches ? event.touches[0] : event;
      drag = true;
      last = { x: point.clientX, y: point.clientY };
    }

    function end() {
      drag = false;
    }

    function move(event) {
      var point;

      if (!drag) {
        return;
      }

      point = event.touches ? event.touches[0] : event;
      target.rotation.y += (point.clientX - last.x) * sx;
      target.rotation.x = Math.max(-Math.PI / 5, Math.min(Math.PI / 5, target.rotation.x + (point.clientY - last.y) * sy));
      last = { x: point.clientX, y: point.clientY };
    }

    container.addEventListener('mousedown', start);
    container.addEventListener('mouseup', end);
    container.addEventListener('mouseleave', end);
    container.addEventListener('mousemove', move);
    container.addEventListener('touchstart', start, { passive: true });
    container.addEventListener('touchend', end);
    container.addEventListener('touchmove', move, { passive: true });

    return function removeDragRotate() {
      container.removeEventListener('mousedown', start);
      container.removeEventListener('mouseup', end);
      container.removeEventListener('mouseleave', end);
      container.removeEventListener('mousemove', move);
      container.removeEventListener('touchstart', start);
      container.removeEventListener('touchend', end);
      container.removeEventListener('touchmove', move);
    };
  }

  function initLightAndShadows3D() {
    var container = byId('canvas-container');
    var loadingEl = byId('canvas-loading');
    var scene;
    var width;
    var height;
    var camera;
    var renderer;
    var lightPosition;
    var pointLight;
    var corona;
    var objectGroup;
    var objectGeometry;
    var positionsAttr;
    var uniquePoints = [];
    var lines = [];
    var onResize;
    var removeDragRotate;
    var time = 0;

    if (typeof THREE === 'undefined' || !container) {
      showToast('The 3D engine is not available right now.');
      return;
    }

    destroyChapterScene();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070d18);
    scene.fog = new THREE.FogExp2(0x070d18, 0.025);
    scene.rotation.y = 1.8;
    scene.rotation.x = 0.1;

    width = Math.max(container.clientWidth, 1);
    height = Math.max(container.clientHeight, 1);
    camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 200);
    camera.position.set(0, 2.5, 13);
    camera.lookAt(1, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.IFP_PIXEL_RATIO || Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;

    // WebGL Hardware crash protection & automatic context recovery
    renderer.domElement.addEventListener('webglcontextlost', function (event) {
      event.preventDefault();
      console.warn('WebGL context lost on display hardware! Pausing loop.');
      if (sceneAnimationId) {
        window.cancelAnimationFrame(sceneAnimationId);
        sceneAnimationId = 0;
      }
    }, false);

    renderer.domElement.addEventListener('webglcontextrestored', function () {
      console.info('WebGL context restored! Auto-rebooting 3D scene.');
      destroyChapterScene();
      scheduleChapterSceneBoot();
    }, false);

    container.appendChild(renderer.domElement);
    sceneRenderer = renderer;
    sceneRoot = scene;

    if (loadingEl) {
      loadingEl.style.display = 'none';
    }

    scene.add(new THREE.AmbientLight(0x0d1b33, 0.4));

    lightPosition = new THREE.Vector3(-4.8, -1.2, 3.0);
    pointLight = new THREE.PointLight(0xffffff, 5.0, 40);
    pointLight.position.copy(lightPosition);
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.set(2048, 2048);
    pointLight.shadow.bias = -0.001;
    pointLight.shadow.camera.near = 0.5;
    pointLight.shadow.camera.far = 25;
    scene.add(pointLight);

    (function addLightVisuals() {
      var rimLight = new THREE.DirectionalLight(0x40d0e0, 0.1);
      var bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      var coronaMaterial = new THREE.SpriteMaterial({
        map: makeGlowTexture(),
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.92
      });
      var stand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.12, 1.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x334455, roughness: 0.8, metalness: 0.5 })
      );
      var pool = new THREE.Mesh(
        new THREE.PlaneGeometry(8, 8),
        new THREE.MeshBasicMaterial({
          map: makeGlowTexture('rgba(160, 220, 255, 0.40)', 'rgba(0,0,0,0)'),
          blending: THREE.AdditiveBlending,
          transparent: true,
          depthWrite: false
        })
      );

      rimLight.position.set(8, 4, -4);
      scene.add(rimLight);

      bulb.position.copy(lightPosition);
      scene.add(bulb);

      corona = new THREE.Sprite(coronaMaterial);
      corona.position.copy(lightPosition);
      corona.scale.set(2.2, 2.2, 1);
      scene.add(corona);

      stand.position.set(lightPosition.x, lightPosition.y - 0.85, lightPosition.z);
      scene.add(stand);

      pool.rotation.x = -Math.PI / 2;
      pool.position.set(lightPosition.x, -2.39, lightPosition.z);
      scene.add(pool);
    })();

    objectGroup = new THREE.Group();
    objectGroup.position.set(0.6, 0.2, 0);
    objectGeometry = new THREE.IcosahedronGeometry(1.4, 0);
    objectGroup.add(new THREE.Mesh(
      objectGeometry,
      new THREE.MeshStandardMaterial({
        color: 0xbbeeff,
        roughness: 0.8,
        metalness: 0.1,
        flatShading: true
      })
    ));
    objectGroup.children[0].castShadow = true;
    scene.add(objectGroup);

    (function addWireframeStand() {
      var pyramid = new THREE.Mesh(
        new THREE.ConeGeometry(0.9, 3.2, 4),
        new THREE.MeshBasicMaterial({ color: 0x99ccdd, wireframe: true, transparent: true, opacity: 0.35 })
      );
      pyramid.position.set(0.6, -1.5, 0);
      pyramid.rotation.y = Math.PI / 4;
      scene.add(pyramid);
    })();

    (function addProjectionScreen() {
      var screenPosition = new THREE.Vector3(-7.27, 1.0, 4.37);
      var screenGeometry = new THREE.CylinderGeometry(15.0, 15.0, 14.0, 64, 16, true, -0.7, 1.4);
      var screenMesh = new THREE.Mesh(
        screenGeometry,
        new THREE.MeshStandardMaterial({
          color: 0xaaddf0,
          roughness: 1,
          metalness: 0,
          side: THREE.DoubleSide
        })
      );
      var gridMesh = new THREE.Mesh(
        screenGeometry.clone(),
        new THREE.MeshBasicMaterial({
          color: 0x336677,
          wireframe: true,
          transparent: true,
          opacity: 0.4,
          side: THREE.DoubleSide,
          polygonOffset: true,
          polygonOffsetFactor: -1
        })
      );

      screenMesh.rotation.y = 2.07;
      screenMesh.position.copy(screenPosition);
      screenMesh.receiveShadow = true;
      scene.add(screenMesh);

      gridMesh.rotation.y = 2.07;
      gridMesh.position.copy(screenPosition);
      scene.add(gridMesh);
    })();

    (function addFloorGrid() {
      var floor = new THREE.Mesh(
        new THREE.PlaneGeometry(22, 16, 22, 16),
        new THREE.MeshBasicMaterial({
          color: 0x40e0d0,
          wireframe: true,
          transparent: true,
          opacity: 0.055
        })
      );

      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -2.4;
      scene.add(floor);
    })();

    (function addRays() {
      var linesGroup = new THREE.Group();
      var rayMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.45
      });

      scene.add(linesGroup);
      positionsAttr = objectGeometry.attributes.position;

      for (var i = 0; i < positionsAttr.count; i += 1) {
        var vertex = new THREE.Vector3().fromBufferAttribute(positionsAttr, i);
        if (!uniquePoints.some(function (point) { return point.distanceTo(vertex) < 0.1; })) {
          uniquePoints.push(vertex);
        }
      }

      uniquePoints.forEach(function () {
        var line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
          rayMaterial
        );
        linesGroup.add(line);
        lines.push(line);
      });
    })();

    removeDragRotate = addDragRotate(container, scene, 0.005, 0.003);

    onResize = function () {
      if (!container || !sceneRenderer) {
        return;
      }
      camera.aspect = Math.max(container.clientWidth, 1) / Math.max(container.clientHeight, 1);
      camera.updateProjectionMatrix();
      sceneRenderer.setSize(Math.max(container.clientWidth, 1), Math.max(container.clientHeight, 1));
    };

    window.addEventListener('resize', onResize);
    sceneCleanup = function () {
      window.removeEventListener('resize', onResize);
      removeDragRotate();
    };

    function animate() {
      sceneAnimationId = window.requestAnimationFrame(animate);

      if (window.IFP_VISIBLE === false || currentScreenId !== 'screen-chapter-detail') {
        return;
      }

      time += 0.012;
      objectGroup.rotation.y += 0.002;
      objectGroup.rotation.x += 0.001;
      objectGroup.updateMatrixWorld();

      uniquePoints.forEach(function (localPosition, index) {
        var worldPosition = localPosition.clone().applyMatrix4(objectGroup.matrixWorld);
        var direction = worldPosition.clone().sub(lightPosition).normalize();
        var endPosition = lightPosition.clone().add(direction.multiplyScalar(24));
        var buffer = new Float32Array([
          lightPosition.x, lightPosition.y, lightPosition.z,
          endPosition.x, endPosition.y, endPosition.z
        ]);
        lines[index].geometry.setAttribute('position', new THREE.BufferAttribute(buffer, 3));
      });

      if (corona) {
        var pulse = 1 + Math.sin(time * 1.8) * 0.14;
        corona.scale.set(2.2 * pulse, 2.2 * pulse, 1);
      }

      pointLight.intensity = 5.0 + Math.sin(time * 3.5) * 0.5 + (Math.random() - 0.5) * 0.2;
      renderer.render(scene, camera);
    }

    animate();
  }

  function init3DSolarSystem() {
    var container = byId('canvas-container');
    var loadingEl = byId('canvas-loading');
    var scene;
    var camera;
    var renderer;
    var starField;
    var sun;
    var planets = [];
    var onResize;
    var removeDragRotate;

    if (typeof THREE === 'undefined' || !container) {
      showToast('The 3D engine is not available right now.');
      return;
    }

    destroyChapterScene();

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      45,
      Math.max(container.clientWidth, 1) / Math.max(container.clientHeight, 1),
      0.1,
      1000
    );
    camera.position.set(0, 30, 45);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(Math.max(container.clientWidth, 1), Math.max(container.clientHeight, 1));
    renderer.setPixelRatio(window.IFP_PIXEL_RATIO || Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x050814);

    // WebGL Hardware crash protection & automatic context recovery
    renderer.domElement.addEventListener('webglcontextlost', function (event) {
      event.preventDefault();
      console.warn('Solar System WebGL context lost! Pausing loop.');
      if (sceneAnimationId) {
        window.cancelAnimationFrame(sceneAnimationId);
        sceneAnimationId = 0;
      }
    }, false);

    renderer.domElement.addEventListener('webglcontextrestored', function () {
      console.info('Solar System WebGL context restored! Auto-rebooting scene.');
      destroyChapterScene();
      scheduleChapterSceneBoot();
    }, false);

    container.appendChild(renderer.domElement);
    sceneRenderer = renderer;
    sceneRoot = scene;

    if (loadingEl) {
      loadingEl.style.display = 'none';
    }

    scene.add(new THREE.AmbientLight(0xffffff, 0.22));
    scene.add(new THREE.PointLight(0xffdcb4, 2.5, 160));

    (function addStarField() {
      var starsGeometry = new THREE.BufferGeometry();
      var starPositions = new Float32Array(1200 * 3);

      for (var i = 0; i < starPositions.length; i += 1) {
        starPositions[i] = (Math.random() - 0.5) * 220;
      }

      starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      starField = new THREE.Points(
        starsGeometry,
        new THREE.PointsMaterial({
          size: 0.12,
          color: 0x88ccff,
          transparent: true,
          opacity: 0.8
        })
      );
      scene.add(starField);
    })();

    sun = new THREE.Mesh(
      new THREE.SphereGeometry(3, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xffaa00 })
    );
    scene.add(sun);
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(3.6, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0.18,
        side: THREE.BackSide
      })
    ));

    [
      { radius: 0.30, distance: 6, speed: 0.020, color: 0x888888 },
      { radius: 0.60, distance: 9, speed: 0.015, color: 0xe3bb76 },
      { radius: 0.65, distance: 13, speed: 0.010, color: 0x3366ff },
      { radius: 0.40, distance: 17, speed: 0.008, color: 0xff3300 },
      { radius: 1.80, distance: 23, speed: 0.004, color: 0xd99b58 },
      { radius: 1.40, distance: 30, speed: 0.003, color: 0xc5ab6e, hasRing: true },
      { radius: 0.90, distance: 36, speed: 0.002, color: 0x66ccff }
    ].forEach(function (planetData) {
      var orbitPoints = [];
      var group = new THREE.Group();
      var mesh = new THREE.Mesh(
        new THREE.SphereGeometry(planetData.radius, 28, 28),
        new THREE.MeshStandardMaterial({ color: planetData.color, roughness: 0.7, metalness: 0.1 })
      );

      for (var i = 0; i <= 64; i += 1) {
        var theta = (i / 64) * Math.PI * 2;
        orbitPoints.push(new THREE.Vector3(
          Math.cos(theta) * planetData.distance,
          0,
          Math.sin(theta) * planetData.distance
        ));
      }

      scene.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(orbitPoints),
        new THREE.LineBasicMaterial({ color: 0x40e0d0, transparent: true, opacity: 0.2 })
      ));

      mesh.position.x = planetData.distance;
      group.add(mesh);
      scene.add(group);

      if (planetData.hasRing) {
        var ring = new THREE.Mesh(
          new THREE.RingGeometry(planetData.radius * 1.4, planetData.radius * 2.2, 32),
          new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
          })
        );
        ring.rotation.x = Math.PI / 2 + 0.3;
        mesh.add(ring);
      }

      planets.push({
        group: group,
        mesh: mesh,
        speed: planetData.speed,
        angle: Math.random() * Math.PI * 2
      });
    });

    removeDragRotate = addDragRotate(container, scene);

    onResize = function () {
      if (!container || !sceneRenderer) {
        return;
      }
      camera.aspect = Math.max(container.clientWidth, 1) / Math.max(container.clientHeight, 1);
      camera.updateProjectionMatrix();
      sceneRenderer.setSize(Math.max(container.clientWidth, 1), Math.max(container.clientHeight, 1));
    };

    window.addEventListener('resize', onResize);
    sceneCleanup = function () {
      window.removeEventListener('resize', onResize);
      removeDragRotate();
    };

    function animate() {
      sceneAnimationId = window.requestAnimationFrame(animate);

      if (window.IFP_VISIBLE === false || currentScreenId !== 'screen-chapter-detail') {
        return;
      }

      starField.rotation.y += 0.0002;
      sun.rotation.y += 0.005;
      planets.forEach(function (planet) {
        planet.angle += planet.speed;
        planet.group.rotation.y = planet.angle;
        planet.mesh.rotation.y += 0.018;
      });
      renderer.render(scene, camera);
    }

    animate();
  }

  function bootChapterScene() {
    var chapter = getCurrentChapter();

    if (!chapter || !chapter.sceneKey || currentScreenId !== 'screen-chapter-detail') {
      return;
    }

    if (chapter.sceneKey === 'lightShadows') {
      initLightAndShadows3D();
      return;
    }

    if (chapter.sceneKey === 'solarSystem') {
      init3DSolarSystem();
    }
  }

  function scheduleChapterSceneBoot() {
    var loadingEl = byId('canvas-loading');

    if (currentScreenId !== 'screen-chapter-detail') {
      return;
    }

    if (loadingEl) {
      loadingEl.style.display = 'flex';
    }

    window.clearTimeout(sceneBootTimer);
    sceneBootTimer = window.setTimeout(function () {
      bootChapterScene();
    }, 90);
  }

  function updateChapterDetail(chapterId) {
    var chapter = getChapter(chapterId);
    var detailTitle = byId('detail-title');
    var detailDescription = byId('detail-description');
    var detailIcon = byId('detail-tab-phosphor-icon');
    var chapterScreen = byId('screen-chapter-detail');
    var startButton = byId('btn-start-journey');
    var nextButton = byId('btn-next-chapter');
    var quizTitle = document.querySelector('#tabpanel-quiz .sol-unlocked-title');
    var quizDescription = document.querySelector('#tabpanel-quiz .sol-unlocked-desc');
    var quizButton = document.querySelector('#tabpanel-quiz .sol-start-btn');
    var canvasLoading = byId('canvas-loading');

    currentChapterId = chapter.id;

    if (detailTitle) {
      detailTitle.textContent = chapter.title;
    }

    if (detailDescription) {
      detailDescription.textContent = chapter.description;
    }

    if (detailIcon) {
      detailIcon.className = chapter.iconClass + ' sol-tab-solo-icon';
    }

    if (chapterScreen) {
      chapterScreen.style.backgroundImage = chapter.id === 'space-solar'
        ? "url('assets/Future verion lowres.jpg')"
        : "url('assets/chapter background lowres.jpg')";
    }

    if (startButton) {
      startButton.textContent = chapter.experienceUrl ? 'Start Journey' : 'Journey Coming Soon';
    }

    if (nextButton) {
      nextButton.textContent = chapter.id === 'space-solar' ? 'Back to Chapter 1' : 'Next Chapter';
    }

    if (quizTitle) {
      quizTitle.textContent = chapter.quizReady ? 'Interactive Quiz' : 'Quiz Coming Soon';
    }

    if (quizDescription) {
      quizDescription.textContent = chapter.quizReady
        ? 'Test your mastery on ' + chapter.title + '.'
        : 'Quiz content for ' + chapter.title + ' is still being prepared.';
    }

    if (quizButton) {
      quizButton.textContent = chapter.quizReady ? 'Start Quiz' : 'Quiz Coming Soon';
    }

    if (canvasLoading) {
      canvasLoading.style.display = 'flex';
    }

    renderDynamicChapterModalities(chapter);

    destroyChapterScene();
    activateTab('experience');
  }

  function navigateTo(screenId, options) {
    var targetScreen = byId(screenId);
    var isDetailScreenChange = screenId === 'screen-chapter-detail' && currentScreenId === 'screen-chapter-detail' && options && options.chapterId && options.chapterId !== currentChapterId;
    var currentActiveScreen = byId(currentScreenId);

    if (!targetScreen) {
      showToast('That screen is not available yet.');
      return;
    }

    if (currentScreenId === 'screen-chapter-detail' || screenId === 'screen-chapter-detail') {
      destroyChapterScene();
    }

    if (isDetailScreenChange) {
      updateChapterDetail(options.chapterId);
      updateBottomNav(screenId);
      scheduleChapterSceneBoot();
      return;
    }

    if (screenId === currentScreenId) {
      return;
    }

    if (options && options.chapterId) {
      updateChapterDetail(options.chapterId);
    } else if (screenId === 'screen-chapter-detail') {
      updateChapterDetail(currentChapterId);
    }

    Array.prototype.forEach.call(document.querySelectorAll('.screen'), function (screen) {
      if (screen.id === screenId) {
        screen.classList.remove('exit-left');
        screen.classList.add('active');
      } else if (screen.classList.contains('active') || screen === currentActiveScreen) {
        screen.classList.remove('active');
        screen.classList.add('exit-left');
        window.setTimeout(function () {
          screen.classList.remove('exit-left');
        }, 280);
      } else {
        screen.classList.remove('exit-left');
        screen.classList.remove('active');
      }
    });

    currentScreenId = screenId;
    updateBottomNav(screenId);

    // Hide the global nav whenever we're inside a chapter — show it on all
    // main menu screens (home, subjects, chapters list, world, profile, exit).
    document.body.classList.toggle('chapter-detail-open', screenId === 'screen-chapter-detail');

    if (screenId === 'screen-chapter-detail') {
      scheduleChapterSceneBoot();
    } else if (screenId === 'screen-world') {
      loadWorldCourses();
    } else if (screenId === 'screen-profile') {
      syncStudentProfile();
    }
  }

  function setOverlayLayout(kind) {
    var overlay = byId('app-overlay');
    var shell = byId('app-overlay-shell');
    var frame = byId('app-overlay-frame');

    if (!overlay || !shell || !frame) {
      return;
    }

    overlay.classList.remove('app-overlay--story', 'app-overlay--fullscreen');
    overlay.style.pointerEvents = 'auto';

    if (kind === 'story') {
      overlay.classList.add('app-overlay--story');
      document.body.classList.remove(FULLSCREEN_OVERLAY_BODY_CLASS);
      overlay.style.background = '';
      overlay.style.backdropFilter = '';
      overlay.style.webkitBackdropFilter = '';
      shell.style.width = '';
      shell.style.height = '';
      frame.style.borderRadius = '';
      return;
    }

    overlay.classList.add('app-overlay--fullscreen');
    document.body.classList.add(FULLSCREEN_OVERLAY_BODY_CLASS);
    overlay.style.background = '';
    overlay.style.backdropFilter = '';
    overlay.style.webkitBackdropFilter = '';
    shell.style.width = '';
    shell.style.height = '';
    frame.style.borderRadius = '';
  }

  function openOverlay(source, kind, options) {
    var overlay = byId('app-overlay');
    var iframe = byId('app-iframe');
    var loader = byId('iframe-loading-dots');
    var finalSource = source;

    if (!overlay || !iframe) {
      return;
    }

    if (options && options.cacheBust) {
      finalSource += (source.indexOf('?') === -1 ? '?' : '&') + 'cb=' + Date.now();
    }

    window.clearTimeout(overlayResetTimer);
    setOverlayLayout(kind);
    iframe.setAttribute('allow', 'autoplay; fullscreen');
    
    if (loader) {
      loader.classList.remove('hidden');
    }
    
    iframe.onload = function() {
      if (loader) {
        loader.classList.add('hidden');
      }
    };

    iframe.src = finalSource;
    overlay.classList.remove('hidden');
  }

  function closeOverlay() {
    var overlay = byId('app-overlay');
    var iframe = byId('app-iframe');

    if (!overlay || !iframe) {
      return;
    }

    document.body.classList.remove(FULLSCREEN_OVERLAY_BODY_CLASS);
    overlay.classList.add('hidden');
    window.clearTimeout(overlayResetTimer);
    overlayResetTimer = window.setTimeout(function () {
      iframe.removeAttribute('src');
    }, 160);
  }

  function updateCarouselArrows() {
    var carousel = byId('experiments-carousel');
    var leftBtn = document.querySelector('.carousel-nav.left');
    var rightBtn = document.querySelector('.carousel-nav.right');

    if (!carousel) return;

    // Check if cards actually overflow the viewport width of the carousel container
    var hasOverflow = carousel.scrollWidth > (carousel.clientWidth + 8);

    if (!hasOverflow) {
      carousel.style.justifyContent = 'center';
      if (leftBtn) leftBtn.classList.add('is-hidden');
      if (rightBtn) rightBtn.classList.add('is-hidden');
    } else {
      carousel.style.justifyContent = 'flex-start';
      var atStart = carousel.scrollLeft <= 10;
      var atEnd = (carousel.scrollLeft + carousel.clientWidth) >= (carousel.scrollWidth - 10);

      if (leftBtn) {
        if (atStart) leftBtn.classList.add('is-hidden');
        else leftBtn.classList.remove('is-hidden');
      }
      if (rightBtn) {
        if (atEnd) rightBtn.classList.add('is-hidden');
        else rightBtn.classList.remove('is-hidden');
      }
    }
  }

  function initCarouselDrag() {
    var carousel = byId('experiments-carousel');
    if (!carousel || carousel._dragInitialized) return;
    carousel._dragInitialized = true;

    var isDown = false;
    var startX = 0;
    var scrollLeftPos = 0;
    var moved = false;

    carousel.addEventListener('mousedown', function(e) {
      if (carousel.scrollWidth <= carousel.clientWidth) return;
      isDown = true;
      startX = e.pageX - carousel.offsetLeft;
      scrollLeftPos = carousel.scrollLeft;
      moved = false;
      carousel.style.scrollBehavior = 'auto';
    });

    carousel.addEventListener('mouseleave', function() {
      if (isDown) {
        isDown = false;
        carousel.style.scrollBehavior = 'smooth';
        updateCarouselArrows();
      }
    });

    carousel.addEventListener('mouseup', function() {
      if (isDown) {
        isDown = false;
        carousel.style.scrollBehavior = 'smooth';
        updateCarouselArrows();
      }
    });

    carousel.addEventListener('mousemove', function(e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - carousel.offsetLeft;
      var walk = (x - startX) * 1.4;
      if (Math.abs(walk) > 6) moved = true;
      carousel.scrollLeft = scrollLeftPos - walk;
    });

    // Horizontal mouse wheel support
    carousel.addEventListener('wheel', function(e) {
      if (carousel.scrollWidth > carousel.clientWidth) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          carousel.scrollBy({ left: e.deltaY * 0.9, behavior: 'auto' });
          updateCarouselArrows();
        }
      }
    }, { passive: false });

    carousel.addEventListener('scroll', updateCarouselArrows);
  }

  function resolveStoryThumbnail(story) {
    if (story && story.thumbnail_url && !story.thumbnail_url.includes('placeholders/')) {
      return story.thumbnail_url;
    }
    var url = (story && story.url) || '';
    var videoId = '';
    if (url.includes('embed/')) {
      var parts = url.split('embed/')[1];
      videoId = parts ? parts.split('?')[0] : '';
    } else if (url.includes('v=')) {
      var parts2 = url.split('v=')[1];
      videoId = parts2 ? parts2.split('&')[0] : '';
    } else if (url.includes('youtu.be/')) {
      var parts3 = url.split('youtu.be/')[1];
      videoId = parts3 ? parts3.split('?')[0] : '';
    }
    if (videoId) {
      return 'https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg';
    }
    return 'assets/chapter%20background%20lowres.jpg';
  }

  function renderDynamicChapterModalities(chapter) {
    if (!chapter) return;

    // 1. Render Experiments Carousel (#experiments-carousel)
    var expCarousel = byId('experiments-carousel');
    if (expCarousel && Array.isArray(chapter.experiments_list)) {
      if (chapter.experiments_list.length === 0) {
        expCarousel.innerHTML = '<div style="color:rgba(255,255,255,0.6); font-size:0.95rem; text-align:center; padding:40px;">No experiments connected yet.</div>';
      } else {
        var expHtml = chapter.experiments_list.map(function(exp, idx) {
          var color = exp.color || '#00d2ff';
          var icon = exp.icon || '🧪';
          var isFeatured = idx === 0 ? ' featured' : '';
          var safeUrl = (exp.url || '').replace(/'/g, "\\'");
          var tagLabel = exp.badge || '3D LAB';
          var likes = exp.likes || '50k';
          var title = exp.title || 'Experiment';
          var author = exp.author || 'by Platform';

          var titleParts = title.trim().split(' ');
          var formattedTitle = titleParts.length > 1 
            ? titleParts.slice(0, -1).join(' ') + ' <em>' + titleParts[titleParts.length - 1] + '</em>'
            : title;

          var customIconUrl = exp.icon_png || (icon && (icon.indexOf('http://') === 0 || icon.indexOf('https://') === 0 || icon.indexOf('.png') !== -1 || icon.indexOf('.webp') !== -1 || icon.indexOf('.svg') !== -1) ? icon : '');
          
          var assetContentHtml = customIconUrl 
            ? '<img src="' + customIconUrl + '" alt="' + title + '" class="exp-asset-img" />'
            : '<span class="exp-asset-icon">' + icon + '</span>';

          var glowColor = color.indexOf('#') === 0 ? color : '#00f0ff';

          return '<div class="experiment-card' + isFeatured + '" onclick="openExperiment(\'' + safeUrl + '\')">' +
            '<div class="experiment-card-stage">' +
              '<div class="exp-stage-floor-glow" style="background: radial-gradient(ellipse at 50% 80%, ' + glowColor + '45 0%, rgba(99, 102, 241, 0.15) 50%, transparent 75%);"></div>' +
              '<div class="exp-top-tag-bar">' +
                '<span class="exp-badge-pill">' + tagLabel + '</span>' +
                '<span class="exp-likes-pill">♥ ' + likes + '</span>' +
              '</div>' +
              '<div class="exp-stage-asset-wrap">' +
                assetContentHtml +
              '</div>' +
            '</div>' +
            '<div class="experiment-card-body">' +
              '<div>' +
                '<h3 class="exp-v2-title">' + formattedTitle + '</h3>' +
                '<p class="exp-v2-desc">Interactive WebGL simulation model and 3D optics experiment ' + author + '.</p>' +
              '</div>' +
              '<div class="exp-v2-footer">' +
                '<button class="exp-v2-btn" type="button">Launch Lab <span class="pill-arrow">→</span></button>' +
                '<span class="exp-v2-rating">⭐ 4.9</span>' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('');
        expCarousel.innerHTML = expHtml;
      }
      initCarouselDrag();
      window.setTimeout(updateCarouselArrows, 60);
    }

    // 2. Render Stories List (#stories-scroll-container)
    var storiesContainer = byId('stories-scroll-container') || document.querySelector('#tabpanel-stories .stories-scroll-container');
    if (storiesContainer && Array.isArray(chapter.stories_list) && chapter.stories_list.length > 0) {
      var storiesHtml = chapter.stories_list.map(function(story) {
        var safeVideoUrl = (story.url || '').replace(/'/g, "\\'");
        var thumb = resolveStoryThumbnail(story);
        var fallbackThumb = 'https://img.youtube.com/vi/fy7eoMef3e8/hqdefault.jpg';
        var title = story.title || 'Story Lesson';
        var tag = story.tag || 'DOCUMENTARY';
        var duration = story.duration || '5:00';
        
        var titleParts = title.trim().split(' ');
        var formattedTitle = titleParts.length > 1 
          ? titleParts.slice(0, -1).join(' ') + ' <em>' + titleParts[titleParts.length - 1] + '</em>'
          : title;

        return '<div class="story-card" onclick="openStoryVideo(\'' + safeVideoUrl + '\')">' +
          '<div class="story-card-stage">' +
            '<img src="' + thumb + '" alt="' + title + '" class="story-thumb-img" onerror="this.onerror=null; this.src=\'' + fallbackThumb + '\';">' +
            '<div class="story-stage-overlay"></div>' +
            '<span class="story-badge-pill">' + tag + '</span>' +
            '<span class="story-duration-pill">⏱ ' + duration + '</span>' +
            '<div class="story-play-glass">' +
              '<svg width="20" height="20" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>' +
            '</div>' +
          '</div>' +
          '<div class="story-card-body">' +
            '<div>' +
              '<h3 class="story-card-title">' + formattedTitle + '</h3>' +
              '<div class="story-meta-row">' +
                '<span class="story-author-name">by Platform Studio</span>' +
                '<span class="story-views-tag">2.5M views</span>' +
              '</div>' +
              '<p class="story-card-desc">' + (story.description || 'Dive deep into visual scientific storytelling and interactive animated explanations.') + '</p>' +
            '</div>' +
            '<div class="story-card-footer">' +
              '<button class="exp-v2-btn" type="button">Watch Story <span class="pill-arrow">→</span></button>' +
              '<span class="exp-v2-rating">⭐ 4.9</span>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
      storiesContainer.innerHTML = storiesHtml;
    }
  }

  function openExperiment(path) {
    if (!path) {
      showToast('This activity is not connected yet.');
      return;
    }
    openOverlay(encodeURI(path), 'fullscreen', { cacheBust: true });
  }

  function openStoryVideo(url) {
    if (!url) return;
    var finalUrl = url;
    if (url.includes('youtube.com/watch')) {
      var v = url.split('v=')[1];
      if (v) {
        var videoId = v.split('&')[0];
        finalUrl = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1';
      }
    } else if (url.includes('youtu.be/')) {
      var v2 = url.split('youtu.be/')[1];
      if (v2) {
        var videoId2 = v2.split('?')[0];
        finalUrl = 'https://www.youtube.com/embed/' + videoId2 + '?autoplay=1';
      }
    }
    openOverlay(finalUrl, 'story');
  }

  function startChapterJourney() {
    var chapter = getCurrentChapter();

    if (!chapter.contentReady || !chapter.experienceUrl) {
      showToast(chapter.title + ' journey is coming soon.');
      return;
    }

    openExperiment(chapter.experienceUrl);
  }

  function goToNextChapter() {
    var currentIndex = DETAIL_CHAPTER_ORDER.indexOf(currentChapterId);
    var nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % DETAIL_CHAPTER_ORDER.length;
    var nextChapterId = DETAIL_CHAPTER_ORDER[nextIndex];

    navigateTo('screen-chapter-detail', { chapterId: nextChapterId });

    if (!getChapter(nextChapterId).contentReady) {
      showToast(getChapter(nextChapterId).title + ' is ready for preview. Full activities are still coming online.');
    }
  }

  function scrollCarousel(direction) {
    var carousel = byId('experiments-carousel');
    if (!carousel) return;

    var card = carousel.querySelector('.experiment-card');
    var scrollAmount = card ? (card.offsetWidth + 28) : 260;

    carousel.scrollBy({
      left: direction * scrollAmount,
      behavior: 'smooth'
    });

    window.setTimeout(updateCarouselArrows, 350);
  }

  // Expose global methods for inline HTML onclick handlers
  window.openExperiment = openExperiment;
  window.openStoryVideo = openStoryVideo;
  window.scrollCarousel = scrollCarousel;
  window.updateCarouselArrows = updateCarouselArrows;
  window.addEventListener('resize', updateCarouselArrows);

  function toggleTheme() {
    var useLightTheme = !document.body.classList.contains('light-theme');

    document.body.classList.toggle('light-theme', useLightTheme);
    saveThemePreference(useLightTheme ? 'light' : 'dark');
    setThemeButtonLabel();
  }

  function toggleAppFullscreen() {
    if (!document.fullscreenElement) {
      if (!document.documentElement.requestFullscreen) {
        showToast('Fullscreen is not available in this browser.');
        return;
      }

      document.documentElement.requestFullscreen().catch(function () {
        showToast('Fullscreen could not be started.');
      });
      return;
    }

    document.exitFullscreen().catch(function () {
      showToast('Fullscreen could not be closed.');
    });
  }

  function addClickListener(selector, handler) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), function (element) {
      element.addEventListener('click', handler);
    });
  }

  function bindTabs() {
    Array.prototype.forEach.call(document.querySelectorAll('.sol-tab'), function (button) {
      button.addEventListener('click', function () {
        activateTab(button.getAttribute('data-tab'));
      });
    });
  }

  function bindPlaceholderButtons() {
    [
      ['#subj-history', 'History content is coming soon.'],
      ['#subj-geography', 'Geography content is coming soon.'],
      ['#subj-pe', 'Physical Education content is coming soon.'],
      ['#subj-arts', 'Arts content is coming soon.'],
      ['#subj-english', 'English content is coming soon.'],
      ['#subj-math', 'Mathematics content is coming soon.'],
      ['#subj-music', 'Music content is coming soon.'],
      ['#ch-skeletal', 'Skeletal System is queued for the next release.'],
      ['#ch-food-health', 'Food and Health is queued for the next release.'],
      ['#ch-pollination', 'Pollination is queued for the next release.'],
      ['#ch-fertilization', 'Fertilization is queued for the next release.'],
      ['#ch-solids', 'Solids, Liquids, and Gases is queued for the next release.'],
      ['#ch-interdependence', 'Interdependence is queued for the next release.']
    ].forEach(function (entry) {
      var element = document.querySelector(entry[0]);

      if (!element) {
        return;
      }

      element.addEventListener('click', function () {
        showToast(entry[1]);
      });
    });

    addClickListener('.nav-btn[aria-label="World"]:not([onclick])', function () {
      showToast('World view is coming soon.');
    });

    addClickListener('.nav-btn[aria-label="Profile"]:not([onclick])', function () {
      showToast('Profile view is coming soon.');
    });

    addClickListener('.nav-btn[aria-label="Exit"]:not([onclick])', function () {
      navigateTo('screen-home');
    });
  }

  function bindOverlayEvents() {
    var overlay = byId('app-overlay');
    var closeButton = byId('close-app-btn');

    if (closeButton) {
      closeButton.addEventListener('click', closeOverlay);
    }

    if (overlay) {
      overlay.addEventListener('click', function (event) {
        if (event.target === overlay) {
          closeOverlay();
        }
      });
    }

    window.addEventListener('message', function (event) {
      if (event.data === 'closeOverlay') {
        closeOverlay();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        if (!byId('app-overlay').classList.contains('hidden')) {
          closeOverlay();
          return;
        }

        if (document.fullscreenElement) {
          document.exitFullscreen().catch(function () {
            showToast('Fullscreen could not be closed.');
          });
        }
      }
    });
  }

  function bindPrimaryButtons() {
    var startJourneyButton = byId('btn-start-journey');
    var nextChapterButton = byId('btn-next-chapter');

    if (startJourneyButton) {
      startJourneyButton.addEventListener('click', startChapterJourney);
    }

    if (nextChapterButton) {
      nextChapterButton.addEventListener('click', goToNextChapter);
    }
  }

  function initSpringSlider() {
    var knob = document.getElementById('spring-slider-knob');
    var track = document.getElementById('spring-slider-track');
    if (!knob || !track) return;

    var isDragging = false;
    var startY = 0;
    var currentOffset = 0;
    var maxOffset = 0;

    function onStart(e) {
      isDragging = true;
      // Calculate maxOffset dynamically because the parent tab might be hidden on load
      maxOffset = (track.clientHeight / 2) - (knob.clientHeight / 2);
      
      var clientY = e.touches ? e.touches[0].clientY : e.clientY;
      startY = clientY - currentOffset;
      knob.style.transition = 'none';
      knob.classList.add('dragging');
    }

    function onMove(e) {
      if (!isDragging) return;
      var clientY = e.touches ? e.touches[0].clientY : e.clientY;
      currentOffset = clientY - startY;

      if (currentOffset > maxOffset) currentOffset = maxOffset;
      if (currentOffset < -maxOffset) currentOffset = -maxOffset;

      knob.style.transform = 'translate(-50%, calc(-50% + ' + currentOffset + 'px))';
    }

    function onEnd(e) {
      if (!isDragging) return;
      isDragging = false;
      knob.classList.remove('dragging');
      
      // Snap back to center
      currentOffset = 0;
      knob.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
      knob.style.transform = 'translate(-50%, -50%)';
    }

    knob.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    
    knob.addEventListener('touchstart', onStart, {passive: true});
    window.addEventListener('touchmove', onMove, {passive: false});
    window.addEventListener('touchend', onEnd);
  }

  // ─── SUPABASE REALTIME PROFILE & COURSE SYNC ───
  var supabaseClient = null;

  function initSupabaseSync() {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    syncStudentProfile();
    fetchCurriculumFromSupabase();
  }

  async function fetchCurriculumFromSupabase() {
    try {
      var r = await fetch(SUPABASE_URL + '/rest/v1/course_chapters?select=*', {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY
        }
      });
      var data = await r.json();
      if (Array.isArray(data)) {
        data.forEach(function(row) {
          var slug = (row.title || '').toLowerCase().includes('light') ? 'light-shadows' : (row.chapter_slug || row.id);
          if (!CHAPTERS[slug]) {
            CHAPTERS[slug] = {
              id: slug,
              title: row.title,
              description: row.description,
              iconClass: 'ph ph-lightbulb',
              sceneKey: 'lightShadows',
              experienceUrl: row.experience_url || 'Chapter_experience_L_S.html',
              quizReady: row.quiz_ready,
              contentReady: true,
              experiments_list: row.experiments_list || [],
              stories_list: row.stories_list || []
            };
          } else {
            if (row.experiments_list && row.experiments_list.length > 0) {
              CHAPTERS[slug].experiments_list = row.experiments_list;
            }
            if (row.stories_list && row.stories_list.length > 0) {
              CHAPTERS[slug].stories_list = row.stories_list;
            }
            if (row.experience_url) {
              CHAPTERS[slug].experienceUrl = row.experience_url;
            }
          }
        });
        renderDynamicChapterModalities(getCurrentChapter());
      }
    } catch(e) {
      console.warn('Using local chapter configuration:', e);
    }
  }

  async function syncStudentProfile() {
    var urlParams = new URLSearchParams(window.location.search);
    var isTeacher = urlParams.get('teacher') === 'true' || urlParams.get('mode') === 'smartboard' || !!localStorage.getItem('teacher_portal_user') || !!localStorage.getItem('edtech_user');
    
    var teacherEmail = urlParams.get('teacher_email') || urlParams.get('email') || '';
    var teacherNameParam = urlParams.get('teacher_name') || '';
    var teacherAvatarParam = urlParams.get('teacher_avatar') || '';
    var teacherDeptParam = urlParams.get('teacher_dept') || '';

    // Check localStorage edtech_user
    var localUserObj = null;
    try {
      var rawU = localStorage.getItem('edtech_user') || localStorage.getItem('teacher_portal_user') || localStorage.getItem('teacher_user');
      if (rawU) localUserObj = JSON.parse(rawU);
    } catch(e) {}
    
    var studentEmail = urlParams.get('email') || '';
    var studentId = urlParams.get('student_id') || urlParams.get('id') || '';
    
    var nameEl = byId('profile-student-name');
    var avatarEl = byId('profile-avatar-img');
    var classEl = byId('profile-student-class');
    var idEl = byId('profile-student-id');
    var headerPill = byId('profile-header-pill');
    var badgeAccess = byId('profile-badge-access');
    var footerSubtext = byId('profile-footer-subtext');

    var stat1Label = byId('stat-1-label');
    var stat1Val = byId('profile-xp');
    var stat1Icon = byId('stat-1-icon');

    var stat2Label = byId('stat-2-label');
    var stat2Val = byId('profile-labs');
    var stat2Icon = byId('stat-2-icon');

    var stat3Label = byId('stat-3-label');
    var stat3Val = byId('profile-hours');
    var stat3Icon = byId('stat-3-icon');

    var stat4Label = byId('stat-4-label');
    var stat4Val = byId('profile-streak');
    var stat4Icon = byId('stat-4-icon');

    if (isTeacher) {
      if (headerPill) headerPill.textContent = 'CLASS 6TH TEACHER COMMAND CENTER';
      
      // Default fallbacks while Supabase query runs
      var initialName = teacherNameParam || (localUserObj ? (localUserObj.name || localUserObj.full_name) : '') || localStorage.getItem('portal_name') || 'Gaurav Roy';
      var initialAvatar = teacherAvatarParam || (localUserObj ? (localUserObj.avatar_url || localUserObj.avatar) : '') || localStorage.getItem('portal_avatar') || 'https://pub-670b98370fe642a2be08ee37cbfd385f.r2.dev/avatars/gauravroy476_gmail_com_1786785035807_profile_1000x1000.jpg';
      var initialDept = teacherDeptParam || (localUserObj ? (localUserObj.department || localUserObj.degree || localUserObj.subject) : '') || localStorage.getItem('portal_designation') || 'Head of Science & Physics';
      var initialId = (localUserObj ? (localUserObj.id || localUserObj.teacher_id) : '') || 'TCH-213948';

      if (nameEl) nameEl.textContent = initialName;
      if (avatarEl) {
        avatarEl.src = initialAvatar;
        avatarEl.style.borderColor = '#F59E0B';
        avatarEl.style.boxShadow = '0 0 20px rgba(245,158,11,0.5)';
      }
      if (classEl) {
        classEl.textContent = initialDept;
        classEl.style.color = '#F59E0B';
      }
      if (idEl) {
        idEl.textContent = 'ID: ' + (initialId.length > 10 ? 'TCH-' + initialId.slice(0, 6).toUpperCase() : initialId);
        idEl.style.color = '#F59E0B';
        idEl.style.borderColor = 'rgba(245,158,11,0.35)';
      }
      if (badgeAccess) {
        badgeAccess.textContent = '🎓 Educator Access';
        badgeAccess.style.color = '#F59E0B';
        badgeAccess.style.borderColor = 'rgba(245,158,11,0.35)';
      }
      if (footerSubtext) footerSubtext.textContent = 'All Class 6th modules unlocked for smartboard presentation.';

      if (stat1Label) stat1Label.textContent = 'Active Students';
      if (stat1Val) stat1Val.textContent = '34 Students';
      if (stat1Icon) stat1Icon.textContent = '👨‍🎓';

      if (stat2Label) stat2Label.textContent = 'Curriculum Modules';
      if (stat2Val) stat2Val.textContent = '8 Subjects';
      if (stat2Icon) stat2Icon.textContent = '📚';

      if (stat3Label) stat3Label.textContent = 'Smartboard Hours';
      if (stat3Val) stat3Val.textContent = '42.5 Hrs';
      if (stat3Icon) stat3Icon.textContent = '🖥️';

      if (stat4Label) stat4Label.textContent = 'Classroom Attendance';
      if (stat4Val) stat4Val.textContent = '98.5%';
      if (stat4Icon) stat4Icon.textContent = '🏫';

      // ── SUPABASE LIVE FETCH FOR TEACHER PROFILE ──
      try {
        var activeEmail = teacherEmail || (localUserObj ? localUserObj.email : '');
        var endpoint = activeEmail
          ? SUPABASE_URL + '/rest/v1/profiles?email=eq.' + encodeURIComponent(activeEmail) + '&select=*'
          : SUPABASE_URL + '/rest/v1/profiles?role=eq.teacher&select=*&limit=1';

        var resp = await fetch(endpoint, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': 'Bearer ' + SUPABASE_KEY
          }
        });
        var profileRows = await resp.json();

        if (!Array.isArray(profileRows) || profileRows.length === 0) {
          // Fallback to teachers table
          var tResp = await fetch(SUPABASE_URL + '/rest/v1/teachers?select=*&limit=1', {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': 'Bearer ' + SUPABASE_KEY
            }
          });
          profileRows = await tResp.json();
        }

        if (Array.isArray(profileRows) && profileRows.length > 0) {
          var dbTeacher = profileRows[0];
          if (nameEl && (dbTeacher.name || dbTeacher.full_name)) {
            nameEl.textContent = dbTeacher.name || dbTeacher.full_name;
          }
          if (avatarEl && dbTeacher.avatar_url) {
            avatarEl.src = dbTeacher.avatar_url;
          }
          if (classEl && (dbTeacher.department || dbTeacher.degree || dbTeacher.subject)) {
            classEl.textContent = dbTeacher.department || dbTeacher.degree || (dbTeacher.subject + ' Faculty');
          }
          if (idEl && dbTeacher.id) {
            idEl.textContent = 'ID: TCH-' + String(dbTeacher.id).slice(0, 6).toUpperCase();
          }
        }
      } catch(err) {
        console.warn('Supabase live teacher profile fetch failed:', err);
      }

    } else {
      // Student Profile Mode
      var storedName = localStorage.getItem('student_portal_name') || 'Alex K.';
      var storedAvatar = localStorage.getItem('student_portal_avatar') || 'assets/avatar.png';
      var storedClass = localStorage.getItem('student_portal_designation') || 'Class 6th Science & Physics';
      
      if (headerPill) headerPill.textContent = 'CLASS 6TH STUDENT COMMAND CENTER';
      if (nameEl) nameEl.textContent = storedName;
      if (avatarEl && storedAvatar) avatarEl.src = storedAvatar;
      if (classEl) classEl.textContent = storedClass;
      if (idEl) idEl.textContent = 'ID: ' + (studentId || 'STU-64029');

      if (studentEmail) {
        try {
          var sResp = await fetch(SUPABASE_URL + '/rest/v1/profiles?role=eq.student&email=eq.' + encodeURIComponent(studentEmail) + '&select=*', {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': 'Bearer ' + SUPABASE_KEY
            }
          });
          var sData = await sResp.json();
          if (Array.isArray(sData) && sData.length > 0) {
            var dbStudent = sData[0];
            if (nameEl && dbStudent.name) nameEl.textContent = dbStudent.name;
            if (avatarEl && dbStudent.avatar_url) avatarEl.src = dbStudent.avatar_url;
            if (idEl && dbStudent.id) idEl.textContent = 'ID: STU-' + String(dbStudent.id).slice(0, 6).toUpperCase();
          }
        } catch(err) {}
      }
    }

    var officialClass6thSubjects = [
      {
        id: 'c6-sci',
        title: 'Class 6th Science',
        class_name: 'Class 6th',
        subject: 'Science',
        chapters_count: 2,
        icon: '💡',
        access: 'Full Access'
      },
      {
        id: 'c6-hist',
        title: 'Class 6th Ancient & World History',
        class_name: 'Class 6th',
        subject: 'History',
        chapters_count: 1,
        icon: '🏛️',
        access: 'Full Access'
      },
      {
        id: 'c6-geo',
        title: 'Class 6th World Geography & Continents',
        class_name: 'Class 6th',
        subject: 'Geography',
        chapters_count: 1,
        icon: '🌍',
        access: 'Full Access'
      },
      {
        id: 'c6-math',
        title: 'Class 6th Mathematics & Geometry',
        class_name: 'Class 6th',
        subject: 'Mathematics',
        chapters_count: 1,
        icon: '📐',
        access: 'Full Access'
      },
      {
        id: 'c6-eng',
        title: 'Class 6th English Literature & Grammar',
        class_name: 'Class 6th',
        subject: 'English',
        chapters_count: 1,
        icon: '📝',
        access: 'Full Access'
      },
      {
        id: 'c6-art',
        title: 'Class 6th Visual Arts & 3D Design',
        class_name: 'Class 6th',
        subject: 'Arts',
        chapters_count: 1,
        icon: '🎨',
        access: 'Full Access'
      },
      {
        id: 'c6-music',
        title: 'Class 6th Music Theory & Acoustics',
        class_name: 'Class 6th',
        subject: 'Music',
        chapters_count: 1,
        icon: '🎵',
        access: 'Full Access'
      },
      {
        id: 'c6-pe',
        title: 'Class 6th Physical Education & Sports Science',
        class_name: 'Class 6th',
        subject: 'Physical Education',
        chapters_count: 1,
        icon: '🏃',
        access: 'Full Access'
      }
    ];

    function renderCourses(coursesToDisplay) {
      var listEl = byId('profile-courses-list');
      if (!listEl) return;
      listEl.innerHTML = '';

      var subjectIcons = {
        'Science': '💡',
        'History': '🏛️',
        'Geography': '🌍',
        'Mathematics': '📐',
        'English': '📝',
        'Arts': '🎨',
        'Music': '🎵',
        'Physical Education': '🏃'
      };

      coursesToDisplay.forEach(function (course) {
        var card = document.createElement('div');
        card.className = 'glass-mini';
        card.style.cssText = 'padding: 16px 22px; border-radius: 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: space-between; gap: 18px; transition: all 0.25s ease; box-shadow: 0 4px 20px rgba(0,0,0,0.25);';
        
        var chapterCount = course.chapters_count || (course.course_chapters ? course.course_chapters.length : 1);
        var icon = course.icon || subjectIcons[course.subject] || '📖';

        card.innerHTML = '\
          <div style="display: flex; align-items: center; gap: 16px; flex: 1; min-width: 0;">\
            <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(0,240,255,0.12); border: 1px solid rgba(0,240,255,0.3); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; flex-shrink: 0;">\
              ' + icon + '\
            </div>\
            <div style="flex: 1; min-width: 0;">\
              <h4 style="font-size: 1.15rem; font-weight: 800; color: white; margin: 0 0 6px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="' + (course.title || 'Subject') + '">' + (course.title || 'Subject') + '</h4>\
              <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">\
                <span style="font-size: 0.78rem; padding: 3px 10px; border-radius: 8px; background: rgba(16,185,129,0.18); border: 1px solid rgba(16,185,129,0.35); color: #10B981; font-weight: 800; white-space: nowrap; flex-shrink: 0;">🟢 Full Access</span>\
                <span style="color: #cbd5e1; font-size: 0.88rem; font-weight: 500; white-space: nowrap;">' + (course.class_name || 'Class 6th') + ' • ' + (course.subject || 'Core Subject') + '</span>\
              </div>\
            </div>\
          </div>\
          <button onclick="navigateTo(\'screen-chapters\')" style="padding: 12px 22px; border-radius: 14px; background: linear-gradient(135deg, #00F0FF, #3B82F6); color: #000; font-weight: 800; border: none; cursor: pointer; font-size: 0.92rem; white-space: nowrap; flex-shrink: 0; box-shadow: 0 0 20px rgba(0,240,255,0.4);">\
            🚀 Launch 3D Lab\
          </button>\
        ';
        listEl.appendChild(card);
      });
    }

    if (supabaseClient) {
      supabaseClient
        .from('courses')
        .select('*, course_chapters(*)')
        .eq('class_name', 'Class 6th')
        .then(function (res) {
          var dbCourses = res.data || [];
          if (dbCourses.length > 0) {
            renderCourses(dbCourses);
          } else {
            renderCourses(officialClass6thSubjects);
          }
        }).catch(function () {
          renderCourses(officialClass6thSubjects);
        });

      supabaseClient
        .channel('public:courses_profile_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, function () {
          syncStudentProfile();
        })
        .subscribe();
    } else {
      renderCourses(officialClass6thSubjects);
    }
  }

  function initUrlRouting() {
    var urlParams = new URLSearchParams(window.location.search);
    var paramClass = urlParams.get('class');
    var paramSubject = urlParams.get('subject');
    var paramChapter = urlParams.get('chapter');
    var paramScreen = urlParams.get('screen');
    var paramMode = urlParams.get('mode');

    // 1. Update Curriculum Badge if class is provided
    if (paramClass) {
      var badge = document.querySelector('.curriculum-badge');
      if (badge) {
        badge.textContent = (paramClass.toLowerCase().includes('cbse') || paramClass.toLowerCase().includes('icse')) 
          ? paramClass 
          : 'CBSE ' + paramClass;
      }
    }

    // 2. If in smartboard mode, add smartboard indicator styling
    if (paramMode === 'smartboard') {
      document.body.classList.add('smartboard-mode');
      var badge = document.querySelector('.curriculum-badge');
      if (badge) {
        badge.style.border = '1px solid #00F0FF';
        badge.style.boxShadow = '0 0 15px rgba(0, 240, 255, 0.4)';
        badge.title = 'Interactive Smartboard Mode';
      }
    }

    // 3. Deep-link navigation
    if (paramChapter) {
      var targetChapterId = 'light-shadows';
      var lowerCh = paramChapter.toLowerCase();
      if (lowerCh.includes('space') || lowerCh.includes('solar') || lowerCh === 'ch-space-solar' || lowerCh === 'space-solar' || lowerCh.includes('orbit')) {
        targetChapterId = 'space-solar';
      } else if (lowerCh.includes('light') || lowerCh.includes('shadow') || lowerCh.includes('optic') || lowerCh === 'light-shadows' || lowerCh.includes('lens') || lowerCh.includes('reflection')) {
        targetChapterId = 'light-shadows';
      }
      navigateTo('screen-chapter-detail', { chapterId: targetChapterId });
    } else if (paramSubject) {
      var lowerSubj = paramSubject.toLowerCase();
      if (lowerSubj.includes('science') || lowerSubj.includes('physic') || lowerSubj.includes('bio') || lowerSubj.includes('chem')) {
        navigateTo('screen-chapters');
      } else {
        navigateTo('screen-subjects');
        // Highlight requested subject
        var subjMap = {
          'history': '#subj-history',
          'geography': '#subj-geography',
          'physical education': '#subj-pe',
          'pe': '#subj-pe',
          'arts': '#subj-arts',
          'english': '#subj-english',
          'mathematics': '#subj-math',
          'math': '#subj-math',
          'music': '#subj-music'
        };
        var targetId = subjMap[lowerSubj];
        if (targetId) {
          var card = document.querySelector(targetId);
          if (card) {
            card.style.borderColor = '#00F0FF';
            card.style.boxShadow = '0 0 25px rgba(0, 240, 255, 0.5)';
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
    } else if (params.get('openWorld') === 'true' || paramScreen === 'screen-world') {
      navigateTo('screen-world');
    } else if (paramScreen) {
      navigateTo(paramScreen);
    }
  }

  function init() {
    applySavedTheme();
    syncFullscreenButton();
    updateBottomNav(currentScreenId);
    updateChapterDetail(DEFAULT_CHAPTER_ID);
    bindTabs();
    bindPrimaryButtons();
    bindPlaceholderButtons();
    bindOverlayEvents();
    initSpringSlider();
    initSupabaseSync();
    initUrlRouting();

    document.addEventListener('fullscreenchange', syncFullscreenButton);
    window.addEventListener('beforeunload', destroyChapterScene);
  }

  function showExitModal() {
    var modal = byId('exit-modal');
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.remove('hidden');
    }
  }

  function closeExitModal() {
    var modal = byId('exit-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.add('hidden');
    }
  }

  function confirmExitSession() {
    closeExitModal();
    // 1. Attempt window.close() to close current browser tab
    window.close();

    // 2. Fallback if browser blocks window.close() (when tab wasn't opened via JS)
    setTimeout(function () {
      if (!window.closed) {
        window.location.href = 'http://localhost:3000/dashboard';
      }
    }, 300);
  }

  window.navigateTo = navigateTo;
  window.activateTab = activateTab;
  window.scrollCarousel = scrollCarousel;
  window.openExperiment = openExperiment;
  window.openStoryVideo = openStoryVideo;
  window.toggleTheme = toggleTheme;
  window.toggleAppFullscreen = toggleAppFullscreen;
  window.closeOverlay = closeOverlay;
  window.showExitModal = showExitModal;
  window.closeExitModal = closeExitModal;
  window.confirmExitSession = confirmExitSession;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
