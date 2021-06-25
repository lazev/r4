const Dialog = {

	onOpenFuncs: {},
	beforeCloseFuncs: {},
	onCloseFuncs: {},

	create: function(opts) {
		return new Promise(function(resolve, reject) {

			if(!opts) opts = {};

			let elem;

			let id        = opts.id          || '';
			let title     = opts.title       || '';
			let html      = opts.html        || '';
			let classes   = [];
			let style     = opts.style       || {};
			let onOpen    = opts.onOpen      || function(){};
			let onCreate  = opts.onCreate    || function(){};
			let open      = opts.open        || false;
			let ephemeral = opts.ephemeral   || false;
			let onClose   = opts.onClose     || false;
			let befClose  = opts.beforeClose || false;
			let buttons   = opts.buttons     || [];

			let over = document.createElement('div');
			let modl = document.createElement('div');
			let head = document.createElement('div');
			let body = document.createElement('div');
			let foot = document.createElement('div');

			let cont, idElem;

			if(opts.elem) {
				elem = opts.elem[0] || opts.elem;
			}

			if(elem) {
				cont = elem;
				idElem = cont.id;
			} else {
				cont = document.createElement('div');
				cont.innerHTML = html;
				idElem = id || 'R4'+ Math.random().toString().substr(-9);
				cont.id = idElem;
			}

			if($('#'+ idElem +'R4Overlay').length) {
				resolve(idElem);
			}

			classes.push((opts.classes) || ['default']);
			classes.push('R4Dialog');

			modl.setAttribute('class', classes.join(' '));

			over.classList.add('hidden');
			over.classList.add('R4Overlay');
			head.classList.add('R4DialogHeader');
			body.classList.add('R4DialogBody');
			foot.classList.add('R4DialogFooter');

			modl.appendChild(head);
			modl.appendChild(body);
			modl.appendChild(foot);
			body.appendChild(cont);
			over.appendChild(modl);

			cont.classList.remove('hidden');

			modl.id = idElem +'R4Dialog';
			over.id = idElem +'R4Overlay';

			if(ephemeral) over.setAttribute('ephemeral', 'true');

			let closer = document.createElement('div');
			closer.innerHTML = '<svg id="i-caret-left" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="16" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"><path d="M22 30 L6 16 22 2 Z" /></svg>';
			closer.style.float = 'left';
			closer.setAttribute('target', idElem);
			closer.classList.add('R4DialogCloser');
			closer.addEventListener('click', function(event) {
				Dialog.close(this.getAttribute('target'));
			});

			head.appendChild(closer);

			if(title) {
				let hTitle = document.createElement('span');
				hTitle.classList.add('R4DialogTitle');
				hTitle.innerHTML = title;
				head.appendChild(hTitle);
			}

			over.addEventListener('mousedown', function(event) {
				if(event.target !== this) return;
				Dialog.closeOverlay(this.id);
			});

			if(buttons.length) {
				let btn, item, strClasses;

				for(let k=buttons.length-1; k>=0; k--) {
					item = buttons[k];

					btn = document.createElement('button');

					classes = [];
					classes.push((item.classes) || ['default']);
					classes.push('R4Buttons');
					classes.push('onRight');

					strClasses = classes.join(' ');

					if(strClasses.indexOf('R4DialogCloser') > -1) {
						btn.setAttribute('target', idElem);
						btn.addEventListener('click', function(event) {
							Dialog.close(this.getAttribute('target'));
						});
					}

					btn.setAttribute('class', strClasses);
					btn.innerHTML = item.label;

					if(item.id) btn.setAttribute('id', item.id);

					if(typeof item.onClick === 'function') {
						btn.addEventListener('click', function(event){
							item.onClick(event);
						});
					}
					foot.appendChild(btn);
				}
			}

			document.body.appendChild(over);

			if(typeof onCreate === 'function') {
				onCreate();
			}

			for(let k in style) modl.style[k] = style[k];

			if(typeof onOpen === 'function') {
				Dialog.onOpenFuncs[idElem] = onOpen;
			}

			if(typeof onClose === 'function') {
				Dialog.onCloseFuncs[idElem] = onClose;
			}

			if(typeof befClose === 'function') {
				Dialog.beforeCloseFuncs[idElem] = befClose;
			}

			if(open) {
				Dialog.open(idElem);
			}

			resolve(idElem);
		});
	},


	open: function(idElemOrOpts) {
		let idElem;

		if(typeof idElemOrOpts === 'object') {
			idElem = Dialog.create(idElemOrOpts);
		} else {
			idElem = idElemOrOpts;
		}

		let over = document.getElementById(idElem +'R4Overlay');
		document.body.appendChild(over);

		over.classList.remove('hidden');

		document.getElementsByTagName('body')[0].classList.add('dialogOpen');

		if(typeof Dialog.onOpenFuncs[idElem] === 'function') {
			Dialog.onOpenFuncs[idElem]();
		}

		/*
		let modl = document.getElementById(idElem +'R4Dialog');
		if(modl.offsetHeight+100 < window.innerHeight) {
			modl.style.marginTop = '50px';
		}
		*/
	},


	close: function(idElem) {
		Dialog.closeOverlay(idElem +'R4Overlay');
	},


	closeOverlay: function(idOver) {
		let over = document.getElementById(idOver);
		let idElem = idOver.replace('R4Overlay', '');
		let retBefClose = true;

		if(typeof Dialog.beforeCloseFuncs[idElem] === 'function') {
			retBefClose = Dialog.beforeCloseFuncs[idElem]();
		}

		if(retBefClose === false) return;

		if(over.getAttribute('ephemeral') == 'true') {
			over.remove();
		} else {
			over.classList.add('hidden');
		}

		if(Dialog.getIdOpenOverlays().length === 0) {
			document.getElementsByTagName('body')[0].classList.remove('dialogOpen');
		}

		if(typeof Dialog.onCloseFuncs[idElem] === 'function') {
			Dialog.onCloseFuncs[idElem]();
		}
	},


	getIdOpenOverlays: function() {
		var ret = [];
		var arr = document.querySelectorAll('.R4Overlay');
		for (let i = 0; i < arr.length; i++) {
			if(!arr[i].classList.contains('hidden')) ret.push(arr[i].id);
		}
		return ret;
	},


	closeLastOpen: function() {
		let arr = Dialog.getIdOpenOverlays();
		if(arr.length > 0) Dialog.closeOverlay(arr.pop());
	}
};