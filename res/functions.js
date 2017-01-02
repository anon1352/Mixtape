function _clear(e){if(e) while(e.firstChild) e.removeChild(e.firstChild);}
function _id(id){ return document.getElementById(id); }
function _selector(s){ return document.querySelectorAll(s); }
function _each(nodelist,callback){ Array.prototype.forEach.call(nodelist,callback); }
function _apply(selector,callback){ _each(_selector(selector),callback); }
function _create(e,id){var T=document.createElement(e); if(typeof id==='string') T.id=id; return T;}
function _load(name){var T=_create('script');T.type='text/javascript';T.src='res/'+name+'.db.json';document.head.appendChild(T);return name+'DB';}
// значит, classList у нас поддерживает неопределенное количество аргументов, а appendChild, видите ли, нет, ага, ну это ненадолго
HTMLElement.prototype.appendChilds=function(){ for(var e in arguments) if(arguments[e].nodeName) this.appendChild(arguments[e]); };
HTMLElement.prototype.cloak=function(){ this.style.display="none"; }
HTMLElement.prototype.reveal=function(){ this.style.display="block"; }
Array.prototype.remove=function(index){ if(index>=0 && index<this.length) this.splice(index,1); }
/*
	НАПИСАЛ КУЧУ ГОВНОКОДА
	@
	ЗАТО НИКУДА НЕ ШЛЁТ ЗАПРОСЫ
	@
	HIRE ME TODAY!
*/
var reset={total:0,shown:0,current:[],tag:'',searching:false};
var options={
	debug:1,
	theme:0,
	limit:6,
	index:Object.keys(database),
	total:0,
	shown:0,
	current:[],
	tag:'',
	ellipsis:{F:42,S:53},
	random:1,
	searching:false,
	searchmode:0,
	radio:0,
	customize:{ /* defaults */
		optLimit:16,
		optTheme:0,
		optSearch:0,
		optRandom:12,
		optRadio:0,
		optDebug:1
	},
	albums:{
		nae:{count:0,title:'NAE'}/*,
		rac:{count:0,title:'RAC'},
		sti:{count:0,title:'Семён Незаметный'},
		brm:{count:0,title:'Бредовые мелодии'},
		nhh:{count:0,title:'0chan Happy Hardcore'},
		cos:{count:0,title:'Cradle of Sage'},
		tra:{count:0,title:'Trippin Anonymouses'},
		bgt:{count:0,title:'Bugghurth'},
		rae:{count:0,title:'RA Experimental'},
		kmm:{count:0,title:'Пока котики мяукают, мир разлагается'},
		nbt:{count:0,title:'0chan 8-bit Mixtapes'},
		rnd:{count:0,title:'Anonymous Singles'}*/
	},
	boards:{
		'cc':{name:'Кокосовый нульчан',address:'http://0chan.cc/'},
		'ni':{name:'Нигма',address:'?'}
	},
	labels:{
		'ra':{name:'Radio Anonymous',address:'https://anon.fm/'}
	}
};
var DOM={
	logo:'logo',
	list:'list',
	counter:'counter',
	feedback:'feedback',
	random:'random',
	albums:'albumlist',
	loading:'loader',
	error:'error',
	moar:'moar',
	reset:'reset',
	quote:'quote',
	search:'search',ksearch:'keywords',
	options:'options',optsaved:'optSaved',opterror:'optError',
	faq:'faq',about:'about'
};

document.addEventListener('DOMContentLoaded',function(){
	options.total=options.index.length;
	for(var element in DOM){ DOM[element]=_id(DOM[element]); }
	for(var E in database){ options.albums[database[E].tag].count++; }
	for(var T in options.albums){
		var li=_create('li');
			li.classList.add('tag');
			li.dataset.tag=T;
			li.title=options.albums[T].title;
			li.innerHTML='<span>'+options.albums[T].count+'</span> '+options.albums[T].title;
		DOM.albums.appendChild(li);
	}

	DOM.logo.onclick=function(){ _reset(); _load(); };
	DOM.feedback.onclick=function(){ window.open("https://anon.fm/feedback/","win1feedback","top=400,left=250,width=560,height=235,toolbar=no"); };
	DOM.random.onclick=function(){
		_reset();
		for(var i=0;i<options.random;i++){ _show(_random()); }
		options.shown=options.random;
		_interact();
		_count(options.random,options.total);
	};
	DOM.moar.onclick=function(){ _load(); };
	DOM.reset.onclick=function(){ _reset(); _load(); };
	DOM.quote.onclick=function(){ _quote(); };
	DOM.search.onkeydown=function(event){ if(event.keyCode==13) _search(ksearch.value); };

	_apply('.dynamic-link',function(element){
		element.onclick=function(event){
			event.preventDefault();
			ajax(element.href,'get',null,null,
				function(success){ DOM.list.innerHTML=success; },
				function(error){ console.log(error); }
			);
		};
	});
	_apply('#optionlist input',function(element){
		element.onkeydown=function(event){
			if(event.keyCode==13){
				if(!/\d+/.test(element.value) || parseInt(element.value)<0){
					DOM.opterror.reveal();
					setTimeout(function(){ DOM.opterror.cloak(); },2000);
					return false;
				}
				if(options.customize.hasOwnProperty(element.name)) options.customize[element.name]=JSON.parse(element.value);
				_opt_save(); _opt_apply();
				DOM.optsaved.reveal();
				setTimeout(function(){ DOM.optsaved.cloak(); },2000);
			}
		};
	});
	_apply('#optionlist select',function(element){
		element.onchange=function(event){
			if(options.customize.hasOwnProperty(element.name)) options.customize[element.name]=element.selectedIndex;
			_opt_save(); _opt_apply();
			DOM.optsaved.reveal(); setTimeout(function(){ DOM.optsaved.cloak(); },2000);
		};
	});

	_opt_load();
	_opt_show();
	_load();
	_quote();
},false);
function createXMLHTTPObject() {
	var XMLHttpFactories=[
		function(){return new XMLHttpRequest();},
		function(){return new ActiveXObject("Msxml2.XMLHTTP");},
		function(){return new ActiveXObject("Msxml3.XMLHTTP");},
		function(){return new ActiveXObject("Microsoft.XMLHTTP");}
	];
	var xmlhttp=false;
	for(var i=0;i<XMLHttpFactories.length;i++) { try { xmlhttp = XMLHttpFactories[i](); } catch (e) { continue; } break; }
	return xmlhttp;
}
function ajax_success(data){ console.log(data); }
function ajax_error(xhr,status){ console.log('HTTP '+xhr+' '+status); }
function ajax_pending(state){ if(state) console.log('ajax state opened'); else console.log('ajax state closed'); }
function ajax(url,method,data,headers,success,error) {
	if(!data && method=='POST') return false;
	if(!(req=createXMLHTTPObject())) return false;
	if(typeof success!='function') success=ajax_success;
	if(typeof error!='function') error=ajax_success;
	req.open(method,url,true); // true for async
	if(!!headers) for(var i in headers) req.setRequestHeader(i, headers[i]);
	req.send(data);
	req.onreadystatechange=function(){
		if(req.readyState==4){
			if(req.status==200 || req.status==304) success(req.responseText,req.getResponseHeader('X-AJAX-Response'));
			else error(req.status,req.statusText);
		}
	};
	return req.responseText;
}
function _opt_load(){
	var S=localStorage.getItem('customize');
	if(!S) _opt_save();
	else {
		var O=JSON.parse(S); if(!O){ _error('Ошибка при загрузке настроек.','Unable to load options @ _opt_load()'); return false; }
		for(var o in O) if(options.customize.hasOwnProperty(o) && O[o]!==undefined){ options.customize[o]=O[o]; }
		_opt_apply();
	}
}
function _opt_save(){ localStorage.setItem('customize',JSON.stringify(options.customize)); }
function _opt_apply(){
	options.limit=options.customize.optLimit;
	if(options.theme!=options.customize.optTheme){
		options.theme=options.customize.optTheme;
		var th=_create('link');
			th.rel="stylesheet";
			th.type="text/css";
			th.media="screen";
			th.href=options.theme?"res/dark.css":"res/light.css";
		document.head.appendChild(th);
		var exist=document.head.querySelector('link[href="res/'+options.theme?"light.css":"dark.css"+'"]');
		if(exist) document.head.removeChild(exist);
	}
	options.searchmode=options.customize.optSearch;
	options.random=options.customize.optRandom;
	options.radio=options.customize.optRadio;
	options.debug=options.customize.optDebug;
	_opt_show();
}
function _opt_show(){
	var D;
	for(var o in options.customize){
		D=DOM.options.querySelector('[name="'+o+'"]');
		if(D){
			if(D.nodeName=='SELECT') D.selectedIndex=options.customize[o];
			else D.value=options.customize[o];
		}
	}
}
function _loading(is){ if(is) DOM.loading.reveal(); else DOM.loading.cloak(); return true; }
function _error(){
	_log('\t[RAMP] /!\\ '+arguments[0]+(options.debug&&arguments[1]?' <'+arguments[1]+'>':''));
	DOM.error.innerHTML=/*DOM.error.innerHTML+*/arguments[0]+(options.debug&&arguments[1]?' &lt;'+arguments[1]+'&gt;<br/>':'<br/>');
	DOM.error.reveal();
}
function _random(list){ return Object.keys(database)[(Math.random()*options.total)<<0]; }
function _interact(){
	_apply('.full',function(element){
		element.onclick=function(event){ if(event.target==this){ this.dataset.toggle="true"; } return true; };
		element.querySelector('div').onclick=function(event){ if(event.target==this){ element.dataset.toggle="false"; } return true; };
	});
	_apply('.tag',function(element){ element.onclick=function(){ _load(this.dataset.tag); }; });
	_apply('.full-tracklist',function(element){
		element.querySelector('label').onclick=function(event){
			var set=this.dataset; // kosteel-driven programming
			if(set.state===undefined || set.state!='1'){
				ajax('res/list/'+set.href,'get',null,null,
					function(success){ _id(set.box).innerHTML='<pre>'+success+'</pre>'; set.state='1'; },
					function(error){ _log(error); }
				);
			} else { _log('Already loaded.'); }
		}
	});
}
function _log(){ for(var A in arguments) console.log(arguments[A]); } // для краткости
function _reset(){
	for(var o in reset){ options[o]=reset[o]; }
	options.total=options.index.length;
	options.current=options.index.slice(0);
	options.tag='';
	_clear(DOM.list);
}
function _load(tag){
	_loading(1);
	DOM.error.cloak();
	if(options.index.length==0){ _error('Ошибка при подзагрузке: индекс пуст, показывать нечего.','Zero index @ _load()'); return false; }
	if(options.shown==0 && !options.searching){ options.current=options.index.slice(0); }
	if(tag!==undefined && options.albums[tag]!==undefined){
		_reset();
		options.tag=tag;
		options.current=[];
		options.index.forEach(function(element,index){ if(database[element].tag==tag){ options.current.push(element); } });
		if(options.current.length==0){ _error('Ничего не найдено.'); _loading(0); return false; }
	}
	var go=new Promise(function(resolve,reject){ // здесь мы только выводим кусок options.current (считая с начала и с лимитом options.limit)
		if(options.current.length==0){ reject(); return false; }
		var entry='';
		var j=options.limit;
			if(j==0) j=options.index.length;
			if(j>=options.current.length) j=options.current.length;
		for(var i=0; i<j; i++){
			entry=0; //entry=(Math.random()*options.current.length)<<0;
			if(!_show(options.current[entry])){ reject(); return false; }
			options.current.remove(entry);
		}
		options.shown+=j;
		_count(options.shown,options.shown+options.current.length);
		resolve();
	});
	go.then(
		function(){ _interact(); setTimeout(function(){ _loading(0); if(options.current.length>0) DOM.moar.reveal(); else DOM.moar.cloak(); },500); },
		function(err){ _error('Ошибка при инициализации.','Catchable promise exception @ _load() @ '+err); }
	);
	return true;
}
function _search(keywords){
	var list=keywords.split(' ');
	if(list.length==0) return false;
	_reset();
	options.searching=true;
	if(options.searchmode){ // conjunctive: one is enough
		options.current=[];
		list.forEach(function(keyword){
			options.index.forEach(function(element,index){
				if(database[element].genre.indexOf(keyword)>=0
				|| database[element].description.indexOf(keyword)>=0
				|| database[element].title.indexOf(keyword)>=0
				|| database[element].subtitle.indexOf(keyword)>=0
				|| database[element].country.name.indexOf(keyword)>=0
				){ if(options.current.indexOf(element)<0) options.current.push(element); }
			});
		});
	}
	else { // disjunctive: reducing results step by step
		list.forEach(function(keyword){
			options.index.forEach(function(element,index){
				if(!(
				   database[element].genre.indexOf(keyword)>=0
				|| database[element].description.indexOf(keyword)>=0
				|| database[element].title.indexOf(keyword)>=0
				|| database[element].subtitle.indexOf(keyword)>=0
				|| database[element].country.name.indexOf(keyword)>=0
				)){ options.current.remove(options.current.indexOf(element)); }
			});
		});
	}
	if(options.current.length==0) _error('Ничего не найдено.');
	else _load();
}
function _count(i,total){ var C=_id('counter'),o=(i<total?i:total); C.innerHTML=_ending(o)+' из '+total; } //"Показано "+o+" "+_ending(o)+" из "+total
function _ellipsis(text){ // ВСЁ ОЧЕНЬ ХУЁВО
	var subtext=text.substring(0,255),cut=0,firstline=true,length=255,lines=0,iterator=0;
	for(var position=0; position<length; position++){
		iterator++;
		if(lines>3) break;
		if(iterator>=(firstline&&options.ellipsis.F||options.ellipsis.S)){
			subtext=subtext.substring(0,cut)+'\n'+subtext.substring(cut,length);
			position=cut;
			firstline=false;
			lines++;
			iterator=0;
		}
		else if(subtext[position]===' ') cut=position+1;
	}
	return subtext;
}
function _ending(num){ // А ЗДЕСЬ ЕЩЁ ХУЁВЕЙ
	switch(num%100){
		case 11:
		case 12:
		case 13:
		case 14:
			return 'Показано '+num+' кассет';
		default:break;
	}
	switch(num%10){
		case 0:
		case 5:
		case 6:
		case 7:
		case 8:
		case 9:
			return 'Показано '+num+' кассет';
		case 1:
			return 'Показана '+num+' кассета';
		case 2:
		case 3:
		case 4:
			return 'Показано '+num+' кассет';
		default:return 'Показано '+num+' кассет';
	}
	return true;
}
function _show(id){
	if(id===undefined || !database[id]){
		_error('Не найден ключ в базе данных.',id);
		return false;
	}
	var data=database[id];
	var temp='';

	var article=_create('article');
		article.id=id;
		article.classList.add('smooth');
		article.style.backgroundImage="url('res/poster/"+data.poster+"')";
	var title=_create('div');
		title.classList.add('title');
		var orgtitle=_create('h3');
			orgtitle.innerHTML='«'+data.title+'»';
			orgtitle.classList.add('orgtitle');
		var subtitle=_create('h4');
			subtitle.innerHTML=data.subtitle;
			subtitle.classList.add('subtitle');
		title.appendChilds(orgtitle,subtitle);
	var ambula=_create('div');
		if(data.ambula){ ambula.innerHTML=_ellipsis(data.ambula); ambula.classList.add('ambula'); }
	var moar=_create('div');
		moar.innerHTML="Подробнее";
		moar.classList.add('full');
		moar.dataset.toggle=false;
		var expandT=_create('div');
			expandT.classList.add('smooth');
			var expand=_create('div');
				var F_poster=_create('a');
					F_poster.href="res/poster/"+data.poster;
					F_poster.target="_blank";
					F_poster.classList.add('full-poster');
					F_poster.style.backgroundImage="url('res/poster/"+data.poster+"')";
				var F_about=_create('div');
					F_about.classList.add('full-about');
					var F_title=_create('div');
						F_title.classList.add('full-title');
						F_title.innerHTML='«'+data.title+'»';
					var F_subtitle=_create('div');
						F_subtitle.classList.add('full-subtitle');
						F_subtitle.innerHTML=data.subtitle;
					var F_edition=_create('div');
						F_edition.classList.add('full-edition');
						F_edition.innerHTML='<span style="color:#'+data.color+'">'+data.edition+'</span>';
					var F_date=_create('div');
						F_date.classList.add('full-date');
						F_date.innerHTML=data.date;
					var F_duration=_create('div');
						F_duration.classList.add('full-duration');
						F_duration.innerHTML=data.duration;
					var F_genre=_create('div');
						F_genre.classList.add('full-genre');
						data.genre.forEach(function(element,index){ F_genre.innerHTML+='<kbd class="tag" data-tag="'+element+'">'+element+'</kbd>&nbsp;'; });
					var F_board=_create('div');
						F_board.classList.add('full-board');
						if(data.board=='no') F_board.innerHTML='(нет борды)';
						else F_board.innerHTML=(options.boards[data.board]?'<noindex><a href="'+options.boards[data.board].address+'" target="_blank" class="board board-'+data.board+'">'+options.boards[data.board].name+'</a></noindex>':data.board);
					var F_specs=_create('div');
						F_specs.classList.add('full-specs');
						F_specs.innerHTML='<span>'+data.bitrate+' kbps / '+(data.stereo?(data.stereo>1?'Joint Stereo / ':'Stereo / '):'Mono / ')+(data.vbr?'VBR':(data.cbr?'CBR':'ABR'));
					var F_posters=_create('div');
						F_posters.classList.add('full-posters');
						F_posters.innerHTML='<a href="res/poster/'+data.poster+'" target="blank">Front</a>, <a href="res/poster/'+data.back+'" target="_blank">Back</a>';
					var F_label=_create('div');
						F_label.classList.add('full-label');
						F_label.innerHTML=options.labels[data.label]?'<noindex><a class="label label-'+data.label+'" href="'+options.labels[data.label].address+'" target="_blank">'+options.labels[data.label].name+'</a></noindex>':data.label;
					var F_link=_create('div');
						F_link.classList.add('full-link');
						F_link.innerHTML='<noindex>'+_link(data.link)+'</noindex>';
					var F_ambula=_create('div');
						F_ambula.innerHTML=data.ambula;
						F_ambula.classList.add('full-ambula');
					var F_fabula=_create('div');
						F_fabula.innerHTML=data.fabula;
						F_fabula.classList.add('full-fabula');
					var F_tracklist=_create('div');
						F_tracklist.classList.add('full-tracklist');
						F_tracklist.innerHTML='<input name="'+id+'s" id="'+id+'s" type="checkbox" class="switch" /><label for="'+id+'s" class="button switch-label" data-box="'+id+'b" data-href="'+data.tracklist+'">Треклист</label><div id="'+id+'b" class="switch-box"></div>';
					F_about.appendChilds(F_title,F_subtitle,F_edition,F_date,F_duration,F_genre,F_board,F_specs,F_posters,F_label,F_link,F_ambula,F_fabula,F_tracklist); // закурил
				expand.appendChilds(F_poster,F_about);
			expandT.appendChild(expand);
		moar.appendChild(expandT);
	article.appendChilds(title,ambula,moar);
	DOM.list.appendChild(article);
	return true;
}
function _link(link){
	if(!link) return '(временно отсутствует)';
	var id=/https?:\/\/(.+\.)?(\w+)\.\w+\/.+/i.exec(link),r='<a href="'+link+'" target="_blank" class="link link-';
	switch(id[2]){
		case 'mega': r+='mega">Mega.nz'; break;
		case 'catbox': r+='catbox">Catbox.moe'; break;
		case 'mixtape': r+='mixtape">Mixtape.moe'; break;
		case 'fuwafuwa': r+='fuwa">fuwa.moe'; break;
		case 'nya': r+='nya">nya.is'; break;
		case '1339': r+='pomf1339">1339.cf'; break;
		case 'rghost': r+='rghost">RGhost'; break;
		default: r+='wtf">Хуй знает какой файлообменник';
	}
	r+='</a>';
	return r;
}
var quotes=[
	'Если что-то может пойти не так, то так и произойдёт.',
	'Все не так легко, как кажется.',
	'Предоставленные самим себе события имеют тенденцию развиваться от плохого к худшему.',
	'Всякое решение плодит новые проблемы.',
	'Все, что может испортиться — портится.',
	'Когда дела идут хорошо, что-то должно случиться в самом ближайшем будущем.',
	'Если эксперимент удался, что-то здесь не так...',
	'Выиграть нельзя. Остаться при своих нельзя. Но можно выйти из игры. ',
	'Все, что начинается хорошо, кончается плохо.',
	'Все, что начинается плохо, кончается еще хуже.',
	'Перед тем, как улучшиться, ситуация ухудшается.',
	'Под всякой бездной раскрывается другая, еще более глубокая.',
	'Число разумных гипотез, объясняющих любое данное явление, бесконечно.',
	'Все законы — имитация реальности.',
	'Когда вы исследуете неизвестное, то не знаете, что обнаружите.',
	'Новые законы создают и новые лазейки.',
	'По-видимому, на свете нет ничего, что не могло бы случится.',
	'Каждый человек на чем-нибудь да помешан.',
	'Дыра это просто ничто, но вы можете и в ней сломать шею.',
	'Лучший выход наружу — всегда насквозь.',
	'Не все, что можно делать безнаказанно, следует делать.',
	'Нет вещи, которую нельзя было бы улучшить.',
	'Единственная практическая проблема — «что делать дальше?».',
	'Решение проблемы изменяет саму проблему.',
	'Если закон Мерфи может не сработать, он не срабатывает.',
	'Нет такой плохой ситуации, которая не могла бы стать еще хуже.',
	'Когда события принимают крутой оборот, все смываются.',
	'В природе всегда сокрыт тайный порок.',
	'Подожди — и плохое само собой исчезнет.',
	'Все тайное становится явным.',
	'Если ситуация была неблагоприятной, она повторится.',
	'Находишь всегда то, что не искал.',
	'Худшее — враг плохого.',
	'Если вам все равно, где вы находитесь, значит, вы не заблудились.',
	'Можно сделать защиту от дурака, но только от неизобретательного.',
	'Стоит запечатать письмо, как в голову приходят свежие мысли.',
	'У самого интересного экспоната не бывает таблички с названием.',
	'Новые системы плодят новые проблемы.',
	'Не следует без необходимости плодить новые системы.',
	'Всё — система.',
	'Всё — часть еще большей системы.',
	'Системы имеют тенденцию расти и по мере роста взаиморастворяться.',
	'Сложные системы приводят к неожиданным последствиям.',
	'Совокупное поведение больших систем предсказать нельзя.',
	'Сама система ведет себя не так, как предписано.',
	'Любая ошибка, которая может закрасться в любой расчет, вкрадется в него.',
	'Вещь нельзя найти, пока не купишь взамен ее другую.',
	'Утерянное всегда находишь в последнем кармане.',
	'Любое внедрение требует доработки.',
	'Время от времени надо отдыхать от ничегонеделанья.',
	'Нет такого пустого писателя, который не нашел бы себе читателя.',
	'Все, что в скобках, может быть проигнорировано.',
	'Хочешь жить в согласии — соглашайся!',
	'Когда корабль не знает, к какой пристани он держит путь, ни один ветер не будет попутным.',
	'Стоит выйти из комнаты, как тебя тут же выберут.',
	'Вы принимаете себя слишком всерьез.',
	'Улыбайтесь, ведь завтра будет хуже.'
];
function _quote(){ DOM.quote.innerHTML=quotes[(Math.random()*quotes.length)<<0]; }

/*
- Planning API by path/location
- Planning increasing db
- Planning settings module
- Planning adding process automatization
- Planning associative keyword mechanism realisation
- Planning interface improvements
- Planning radio support
- Planning visualizing
- Planning magnetlinks realization
- Planning counter improvement
- Planning `done` section
- Planning videostream
*/