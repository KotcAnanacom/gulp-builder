#  Gulp сборка для фронтенд-разработки 

> _используеться  Gulp 5  версии_

---

## Установка 
1. Скачайте и установите Node.js версии `18.20.5` или выше.
2. Создайте новый проект.
3. Клонируйте репозиторий (`git clone <this repo>`) или скачайте архив и распакуйте его вручную.
4. В корне проекта выполните команду `npm i` для установки зависимостей.




## Использование

- `gulp` — запустить проект в режиме **разработчика**.
- `gulp --build` — собрать сборку в режиме **production**.
- `gulp --prev` — просмотреть результаты в режиме **production**.
- `gulp zip` — создать zip-файл проекта.


## Структура файлов
```py
.
├─ app                # Главная папка для работы
│  ├── blocks         # HTML файлы
│  ├── fonts          # Шрифты
│  ├── images         # Изображения
│  │   └── sprite     # SVG-файлы для спрайтов
│  ├── js             # Скрипты
│  │   ├── components  # JS-компоненты
│  │   └── libs       # Библиотеки
│  ├── resources      # Разные файлы (PHP, favicon, видео)
│  └── scss          # Стили
│      ├── base      # Базовые стили
│      ├── components # SCSS-компоненты
│      ├── libs      # Библиотеки
│      └── mixins    # Миксины
│
├── .editorconfig     # Настройки форматирования кода
├── .eslintrc.json    # Настройки ESLint
├── .htmlhintrc       # Настройки HTMLHint
├── .stylelintrc.json # Настройки Stylelint
├── gulpfile.js       # Конфигурация Gulp
├── package.json      # Настройки и зависимости проекта
├── readme.txt        # Документация сборки
└── README.md         # Документация сборкии
```

### HTML
* Проверка html на **БЭМ** методологию. 
- Благодаря плагину **gulp-file-include** можно разделять на html-файлы, которые хранятся в папке **blocks**.

	> Для вставки html-частей в главный файл используйте `@include('./blocks/filename.html')`.

* При режиме **production** вы получите сжатый(минифцированный) и очищенный от комментариев html-код.
* Используется **htmlhint** для проверки корректности написания html-кода.


### CSS
* В сборке используеться **scss** препроцессор
* Все файлы с папки scss подключать в файл `main.scss`
* Для подключения файлов используйте директиву `@use`, `@forward`
* Если нужно подключить сторонние css-файлы (библиотеки) — положите их в папку **libs**. Затем так же подключите в **main.scss** . По умолчанию там уже есть некоторые библиотеки, просто расскоментируйте. если понадобиться
* В режиме **production** вы получите сжатый(минифцированный) и очищенный от коментариев css-код
* Используеться **stylelint** для _правильного_ порядка записи свойств.


### JavaScript
* В сборке используеться _webpack_
* Js код можно разделить на отдельные файлы, расположенные в папке **components**. `Подключение файлов осуществляется с помощью импорта ES6 модулей.`
* Используйте `import` для подключения. Подключать все файлы в **main.js**
* Если нужно подключить сторонние библиотеки — положите их в папку **libs**. Затем так же подключите в **main.js**. По умолчанию уже есть некоторые
* Проверка js кода на наличие ошибок с помощью **Eslint**


### Изображения
* Все изображения, кроме **ico**, необходимо поместить в папку `images`.
* В режиме **production**  изображения будут сжаты и конвертированы в форматы _avif_ и _webp_. Подключить их можно с помощью тега `picture` (который) **автоматически** подключиться вместо тегов img, если будет расширение _svg_, то не будет конвертирован в тег **picture**


### SVG
* Если вам не нужны SVG-спрайты, просто помещайте файлы в папку `images` или в другие созданные вами папки (кроме `sprite`). Если же спрайты необходимы, разместите их в папке `sprite`. Такие атрибуты как _fill_, _stroke_, _style_ будут автоматически удаляться при svg-спрайтах


### Инные ресурсы
* Для других ресурсов таких как 
	> php, video, ico, webp, avif и прочие положите их в папку **resources**.


### Шрифты
* В папку `fonts` помещайте шрифты в любом формате, кроме **woff**, так как они не будут конвертированы. Файлы шрифтов должны иметь названия с тире, например: `"Roboto-Medium"` или `"Roboto-BlackItalic"`, чтобы автоподключение работало корректно.
* Файл `_fonts.scss` в папке **scss** будет создан автоматически при подключении шрифтов. Если вы добавили новый шрифт, его нужно подключить вручную в этом файле с помощью `include`. Либо вы можете удалить этот файл и перезапустить сборку — в этом случае шрифты подключатся автоматически.

### Возможности
* Для корректного отображения текста на странице был подключен плагин типограф, которые автоматически добавит неразрывные пробелы и иные символы, чтобы текст везде отображался по всем правилам 
* Чтобы упростить написание путей в VS Code, можно настроить плагин `Path Autocomplete`(скачав его). Добавьте в файл настроек JSON следующий код:
```json
"path-autocomplete.pathMappings": {
  "#img": "${folder}/app/images"
}
``` 
Теперь, используя **#img**, вы сможете 		автоматически получать подсказки для путей к изображениям. Например: `#img/icon/arrow.svg`.

---
### Изменение в версии 1.0.2 (22.12.2024)

1. Изменил зависимости на более _новые версии_ (теперь [node js](https://nodejs.org/en/) нужен версии 18.20.5 и выше)
2. Добавлен плагин `w3c-html-validator`, который автоматически проверяет ваш html код на валидность и выводить ошибки в консоль
3. Теперь возможен импорт _css-файлов_ в _js-файлы_ (ранее импортировались только js-файлы). Пример `import 'simplebar/dist/simplebar.css'`
4. В _dependencies_ добавлены новые библиотеки в том числе и мой плагин `darkmodal` для модальных окон, который уже подключен в `app/js/libs/modal.js`. Для завершения настройки его нужно подключить **main.js**. Для получения подробной информации о использовании → [ссылочка](https://www.npmjs.com/package/darkmodal) 
5. Добавлены и улучшены различные функции и миксины в _scss_. Теперь необходимо в `app/scss/base/_vars.scss` указать максимальную ширину и минимальную ширину сайта. Так же переходим на **rem** еденицы измерения для лучшей доступности (в процессе) 

---

### Заключение
Если вы нашли баг, ошибку, недоработку или просто дать идеи для сборки — пишите мне в 💬 [Telegram](https://t.me/kotcananacom)!
