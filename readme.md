# Indigo

Indigo – это React-подобная библиотека для построения пользовательских интерфейсов использующая HTML-шаблоны вместо JSX и написанный на TypeScript и для TypeScript..

Установка

Для установки библиотеки и тестового приложения к ней клонируйте репозиторий [https://github.com/kgtulin/indigo](https://github.com/kgtulin/indigo)

Репозиторий содержит настроенные библиотеки и утилиты:

- Webpack  
- Babel  
- HTML Loader  
- Style Loader/CSS Loader  
- TS Loader/TypeScript

Для большей информации смотрите соответствующие конфиги.

# Общие сведения

Компонент, это класс, который наследуется от IndigoComponent. Каждый компонент содержит два основных объекта:

## Состояние (state)

Состояние – реактивные данные компонента. Состояние нельзя менять напрямую, а только вызовом метода setState. Данный метод проводит глубокую проверку полученных данных и вызывает обновление компонента только при реальных изменениях значений. Пример:

Type State = {rest: number, ware: {id:number, name: string}}
export default AppComponent extends IndigoComponent {
    state: State = { 
	    rest: 12, ware: {id:10, name: ”Ноутбук Acer EX 150”}}
    }
    onMount (){
	    this.setState( ware: {id:1})
}}

В данном примере setState пытается обновить поле id и только если значения различаются вызывается метод forceUpdate  для компонента.

## Входные данные (props)

Входные данные – это данные переданные в компонент через атрибуты “:” в теге, описывающем компонент. Например:  
< basket-item  :ware=”currentItem”></basket-item>

В данном примере в props  будет передан ключ ware  и соответствующее значение. Доступ к этим данным можно получить через объект this.props, например: this.props.ware.

**Props типизируются так же как и state.**

type Props= {id: number, name: string}
export default AppComponent extends IndigoComponent {
props: Props = {id:10, name: ”Ноутбук Acer EX 150”  }
}

**Props никогда не должен изменяться.**

Props  конечного компонента расширяется данными из props всех родительских компонентов. Данные не переопределяются, а добавляются. Так если в объекте shop  есть пропс props.currency в дочернем объекте catalog  есть props.discount  и объекте ware есть props.price в результате в catalog  будет добавлен объект currency, в props  ware  будет добавлено и currency  и discount.

# HTML  шаблон

Шаблон – это валидный фрагмент HTML-документа, который может содержать как простой HTML так и объявления компонентов, директивы и управляющие конструкции и выражения на JavaScript.

## Объявление  компонентов

<component-name component-props></component-name>

## Директивы:

**:attr-name = java_script_expression”** должно содержать выражение JavaScript, например :src=”ware.image”

* При применении в тэге компонента передает в его значения props. В тэге компонента можно указать ссылку на функцию родительского компонента как на обработчик события.  
* При применении в обычном HTML тэге создает атрибут с именем attr-name  и вычисленном JavaScript  выражении. Например :style={{getStyle()}}  ”.

**@event-name=”path_to_method”** ссылка на событие

* При применении к тэгу компонента передает в props  компонента с именем event-name ссылку на метод родительского компонента. Дочерний компонент может вызывать метод родительского компонента: props.event_name.(...arams). В теге компонента можно передать событие через и атрибут :attrib-name.

* Применении к обычному тегу задает обработчик события event-name (например mouseover, keydown) без приставки on. Обработчик должен быть определен в текущем компоненте. Обработчик события автоматически отписывается от цели события.

**#ref-name** ссылка на компонент или HTML  Element.

* При указании в тэге компонента передает в props  родительского компонента ссылку на текущий компонент.

* При указании в обычном тэге компонента в его (компонента) props передается ссылка на HTML  Element.

**:classes**  задание классов для HTML  элемента. :classes  должен быть определен в текущем компоненте. Пример определения классов: {active: true, disabled: false} active будет добавлен в список классов, disbled  будет удален из списка.

**:styles** задание стилей для элемента. Должен быть определен в текущем компоненте. Например: {background: silver, borderColor:red, textDecoration: underline}

Если поместить classes  и styles  в объект state и в дальнейшем изменять их через setState  можно добиться реактивности стилей и классов.

**Все из вышеописанных атрибутов автоматически приводятся к camelCase, например change-text будет преобразован в changeText.**

# Управляющие конструкции

**< i-if test=”expression”>** вложенный в директиву код выполняется если expression преобразуется к true. В противном случае выполняется < i-else> если задано

**< i-switch test=”expression”>**

**< i-case value=”expression”>**
**</ i-case>**

**< i-default>**
**</ i-default>**

**</ i-switch>**

Работает  аналогично switch/case/default в JavaScript но без оператора brak (он автоматически применяется к каждому блоку case)

**<i-for test=”item of/in items”>**  где items – это  выражение  на JavaScript. Переменная item  будет доступна в дочерних элементах в шаблоне компонента.

**< component-children>< /component-children>** внутрь этой конструкции рендерится все что указано в компоненте между его тегами. Например:

< shop>

< ware …>< /ware>
< ware …></ ware>

</ shop>

Теперь, если в произвольном месте в шаблоне компонента shop указать < component-children> туда будут перенесены данные < ware …>

# Провайдеры

Для того что бы передавать вниз по дереву компонентов какие-либо объекты предназначены провайдеры.

**Определение провайдера**:

class TestComponent extends IndigoComponent {
providers = { testProvider1: null, testProvider2: null}
onCreate(){
this.providers.testProvider1=new TestProvider1();
this.providers.testProvider2=new TestProvider2();
}

После определения провайдеров доступ к ним из дочерних компонентов можно получить **provider(“testProvider1”)** возвращает провайдер с указанным именем имеющий тип any.

# Методы и свойства компонентов

## * router – объект управляющий роутингом

Содержит два метода: match(url:string, result: Map): Boolean – возвращает true  если переданный url  совпадает с текущим url страницы. Url  может содержать шаблоны, например: /forum /:theme_id/:message_id в этом случае в result (если он не null) будут записаны значения message_id  и theme_id и метод navigate(url:string) – метод перехода на другую страницу (см. раздел роутинг).

## * определение провайдеров (см. выше)

## * метод **forceUpdate**()

Заставляет компонент обновить свое представление в виртуальном дереве и перестроить DOM  дерево.

# Жизненный цикл компонентов

**onCreate** – вызывается при создании компонента

**onBeforeMount**  – вызывается непосредственно перед монтирование компонента в дерево.

**onMount** – вызывается при подключении компонента к реальному DOM  дереву. Только в вызове onMount (или после него) в пропсах будет доступ к сылкам на HTML элементы (например <input  type=”text” #input></input>).

**onDestroy** – вызывается перед уничтожением компонента

# Выражения JavaScript

В библиотеке поддерживаются выражения:

* обращение к свойству объекта: obj[prop] или obj.prop
* вызов функции
* константы: «строка», 1203, true|false  и т.д.
* условные  операторы condition?true_expr:false_expr
* операторы >, <, ==, *, % и т.д. поддерживаются все операторы кроме: =, ++, --, +=, -=

Выражения можно использовать:

*** В интерполяции**: указывается {{выражение|фильтр}} где |фильтр – инсталлированная функция обработки текстового параметра (см. настройка Indigo). Интерполяцию можно использовать в тексте HTML фрагментов и в обычных атрибутах, например src = ”{{ware.image}}”

**в атрибутах test** в < If>, < for>, < switch>
**в атрибуте value**  директивы < case>
**в директивах** :(двоеточие), @, :classes, :styles

При использовании интерполяции в атрибуте img.src браузер в консоли выдает ошибку 404, это связано с тем, при анализе шаблона создается объект img с атрибутом «{{expr_image}}» который при дальнейшей обработке будет заменен на реальный путь к изображению. Что бы избежать таких ошибок определяйте атрибут как :src=”выражение”.

**ВАЖНО: при вызове методов в выражениях методы теряют указатель** **this, поэтому их нужно определять через функцию-стрелку**.

# Настройка Indigo

Для работы Indigo  ему нужно сообщить об используемых компонентах и фильтрах.

Компонент  определяется  как  функция indigo.component(“component-selector”, component_class)

где indigo – экземпляр класса Indigo.

Определение  фильтра: indigo.filter(“filter-name”, filter_function);

Рендер:

Indigo.render(target, component-name)

Где target – HTML  Element к который будет производится рендер, а component-name – имя начального компонента.

# Рендеринг

HTML-дерево строится в два этапа, на основе данных компонентов строится виртуальное дерево, затем перестраивается реальное дерево. Для повышения производительности при построении реального дерева по возможности минимизируются операции с DOM. Оптимизация рендеринга не требует от программиста специальных усилий, единственное что можно посоветовать – это помещать шаблоны компонентов в один корневой элемент, например, в <div>.

# Роутинг

**Директива** **route** принимает два аргумента, url  – шаблон для сравнения с текущим адресом и title – заголовок окна если шаблон совпал с текущим адресом. Если шаблон совпал, директива рендерит все дочерние узлы. Например:

< route :url="'/ware’/:id" :title="Товар'">
< ware :shop="provider('shop')"></ shop>
</ route>

**Директива router-link**  используется для создания навигации. Принимает следующие пропсы:

normalClass – класс для ссылки в нормальном состоянии  
activeClass – класс для ссылки совпадающей с текущим адресом  
hoverClass – класс для ссылки при наведении  
visitedClass – класс для посещенной ссылки

**Директива router-link-group** используется для определения группы ссылок router-link с одними и теми же классами. Принимает те же параметры что и router-link и передает их дочерним элементам.
