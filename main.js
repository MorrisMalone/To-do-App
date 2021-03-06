// ----------------------------------
// Projects class

class Project {
    constructor(title, dueDate, tasks = [], description = '') {
        this.title = title;
        this.dueDate = dueDate;
        this.tasks = tasks; // array of tasks
        this.description = description; // optional
        this.done = false;
        this.countId = 0;
    }

    createId() { // return a unique id for a task (related to this project)
        return this.countId++;
    }

    sortTasks() {
        this.tasks = this.tasks.sort((a, b) => {
            if (a.done && !b.done) {
                return 1;

            } else if (!a.done && b.done) {
                return -1;

            } else return 0;
        })
    }

    addTask(title, done) { // create the task (should I make a task class?)
        let task = {
            id: this.createId(),
            title: title,
            done: done,
        };
        this.tasks.push(task);
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id != taskId); // filter out
    }

    getDaysToToday() {
        const dueDate = this.dueDate;
        const now = new Date();
        const distance = dateFns.differenceInCalendarDays(dueDate, now);
        return distance;
    }

    isDone() {
        return this.tasks.every(task => task.done);
    }
}

//--------------------------------------------
// Projects container / controller / to store the projects created

class Controller {
    constructor(projects = [], countId = 0) {
        this.projects = projects;
        this.countId = countId;
    }

    createId() {
        return this.countId++;
    }

    sortProjects() {
        this.projects = this.projects.sort((a, b) => a.getDaysToToday() - b.getDaysToToday());
    }

    addProject(project) {
        project.id = this.createId();
        this.projects.push(project);
    }

    deleteProject(projectId) {
        this.projects = this.projects.filter(project => project.id != projectId); // doesn't suppress but filter out
    }

}

// ------------------------------
// DOM Stuff to create the page that displays the projects and their main infos

const projectsContainer = document.getElementById('projects-container');

function populateProjectsContainer(arrOfProjects) {

    const addNewProject = document.createElement('div'); // button to create a new project
    addNewProject.classList.add('add-new-project');
    addNewProject.innerHTML = `<i class="fas fa-plus"></i> Create new project`;

    addNewProject.addEventListener('click', function () {
        displayNewProject(null)
    });

    projectsContainer.appendChild(addNewProject);

    arrOfProjects.forEach(project => {
        const projectDiv = document.createElement('div'); // create div which containerIconAndDays the project title + infos
        projectDiv.setAttribute('id', `project-${project.id}`);
        projectDiv.classList.add('project');

        const projectTitleH3 = document.createElement('h3'); // create h3 tag for title
        projectTitleH3.classList.add('project-title');
        projectTitleH3.textContent = project.title;

        const daysContainer = document.createElement('div'); // div which containerIconAndDays distance to dueDate and date
        daysContainer.classList.add('days-container');

        const daysToDateDiv = document.createElement('div'); // display number of calendar days to due date from today
        daysToDateDiv.textContent = `${project.getDaysToToday()}`;
        daysToDateDiv.classList.add('days-distance');
        daysToDateDiv.classList.add('flex-centered');

        const dateDiv = document.createElement('div');
        dateDiv.classList.add('date');
        dateDiv.textContent = `${dateFns.format(project.dueDate, 'DD.MM.YY')}`;

        daysContainer.appendChild(daysToDateDiv);
        daysContainer.appendChild(dateDiv);

        // put the project div in form
        projectDiv.appendChild(projectTitleH3);

        if (project.isDone()) { // if a project is done then add done-icon
            const containerIconAndDays = document.createElement('div');
            containerIconAndDays.classList.add('flex-centered');
            containerIconAndDays.classList.add('project-is-done');
            containerIconAndDays.innerHTML += `<i class="far fa-check-circle"></i>`;
            containerIconAndDays.appendChild(daysContainer);
            projectDiv.appendChild(containerIconAndDays);

        } else projectDiv.appendChild(daysContainer);

        projectDiv.setAttribute('data-type', 'project');

        projectDiv.addEventListener('click', function () {
            showProject(project)
        });

        projectsContainer.appendChild(projectDiv);

    })
}

// ------------------------------------------
// function to clear the projects container
// basically to clear between pages

function clearProjectsContainer() {
    while (projectsContainer.children.length > 0) {
        projectsContainer.removeChild(projectsContainer.firstChild);
    }
}

// --------------------------
// display the project when clicked on

function showProject(project) {
    clearProjectsContainer();

    populateProjectInfos(project);

    addListenersCheck();
    saveOnLocalStorage();
}

// ----------------------------------
// go back home function

function goHome() {
    clearProjectsContainer();

    controller.sortProjects();
    populateProjectsContainer(controller.projects);
    saveOnLocalStorage();
}

// -----------------------------------
// populate the infos about the selected project

function populateProjectInfos(project) {

    project.sortTasks(); // display the undone tasks on

    createNavBar(project);

    addProjectInfos(project);
    //-------------------------------------------------
    // make the task div/section
    createTasksDiv(project);

    saveOnLocalStorage();
}

//-----------------------------------------
// create nav bar for a displayed project

function createNavBar(project) {
    // make the nav bar
    const nav = document.createElement('div');
    nav.classList.add('nav');

    // to go back to main page
    const arrowBack = document.createElement('div');
    arrowBack.innerHTML = `<i class="far fa-arrow-alt-circle-left"></i>`;
    arrowBack.classList.add('arrow-back');
    arrowBack.addEventListener('click', goHome);

    // to edit this displayed project
    const edit = document.createElement('div');
    edit.innerHTML = `<i class="far fa-edit"></i>`;
    edit.classList.add('edit');
    edit.addEventListener('click', function () {
        editProject(project)
    });

    nav.appendChild(arrowBack);
    nav.appendChild(edit);
    projectsContainer.appendChild(nav);
}

//-----------------------------------------
// make the project-main-infos div (title, description, days left...)

function addProjectInfos(project) {

    let projectInfosInnerHtml = `
    <section data-projectId="${project.id}" class="show-project">
    <div class='project-display'>
    <h3 class='project-title'>${project.title}</h3>
    <div class='days-container'>
    <div class='days-distance flex-centered'>${project.getDaysToToday()}</div>
    <div class='date'>${dateFns.format(project.dueDate, 'DD.MM.YY')}</div>
    </div>
    </div>
    ${project.description ? `<div class='description'>${project.description}</div>` : ''}
    </section>
    `;

    const projectInfos = document.createElement('div');
    projectInfos.innerHTML += projectInfosInnerHtml;

    projectsContainer.appendChild(projectInfos);
}

// --------------------------------------------
// create the tasks div for a displayed project

function createTasksDiv(project) {
    let tasks = '';

    if (project.tasks.length > 0) {

        for (let i = 0; i < project.tasks.length; i++) {
            project.tasks[i].done ? tasks += `<div data-taskId='${project.tasks[i].id}' data-projectId='${project.id}' class='task done'><p>${project.tasks[i].title}</p><i class="far fa-check-circle"></i></div>` :
                tasks += `<div data-taskId='${project.tasks[i].id}' data-projectId='${project.id}' class='task'><p>${project.tasks[i].title}</p><i class="far fa-check-circle"></i></div>`;
        }
    }

    const tasksSection = document.createElement('section');
    tasksSection.classList.add('tasks-section');
    tasksSection.innerHTML = tasks;

    projectsContainer.appendChild(tasksSection);

}

// ------------------------------------------
// to toggle if a task is done or not and save it to the project

function addListenersCheck() {
    const checkers = document.querySelectorAll('.fa-check-circle');
    checkers.forEach(checker => checker.addEventListener('click', checkIt));
}

function checkIt(e) {
    const projectId = e.target.parentNode.dataset.projectid;
    const taskId = e.target.parentNode.dataset.taskid;

    let project = controller.projects.filter(project => project.id == projectId)[0];
    let task = project.tasks.filter(task => task.id == taskId)[0];
    task.done = !task.done;

    e.target.parentNode.classList.toggle('done');
    saveOnLocalStorage();
}


// ----------------------------------------------
// to edit an existing project

function editProject(project) {
    project.sortTasks();
    displayNewProject(project);
    saveOnLocalStorage();
}

// ---------------------------------------------
// form for a new project

function displayNewProject(project) {
    clearProjectsContainer();

    const nav = document.createElement('div');
    nav.classList.add('nav');

    const arrowBack = document.createElement('div');
    arrowBack.innerHTML = `<i class="far fa-arrow-alt-circle-left"></i>`;
    arrowBack.classList.add('arrow-back');
    arrowBack.addEventListener('click', goHome);

    const saveProject = document.createElement('div');
    saveProject.classList.add('save-project');
    saveProject.innerHTML = `${project ? 'update project' : 'save this project'} <i class="far fa-save"></i>`;

    if (project) {
        saveProject.addEventListener('click', function () {
            udpateProject(project)
        });

    } else saveProject.addEventListener('click', createProject);

    nav.appendChild(arrowBack);
    nav.appendChild(saveProject);

    projectsContainer.appendChild(nav);

    // project section -------------------

    const projectSection = document.createElement('section');

    const titleInput = document.createElement('input');
    titleInput.setAttribute('type', 'text');
    titleInput.setAttribute('placeholder', 'Title');
    titleInput.required = true;
    titleInput.classList.add('title-input');

    const dateInput = document.createElement('input');
    dateInput.classList.add('date-input');
    dateInput.setAttribute('type', 'date');
    dateInput.setAttribute('value', `${dateFns.format(new Date(), 'YYYY-MM-DD')}`);
    dateInput.setAttribute('min', `${dateFns.format(new Date(), 'YYYY-MM-DD')}`);


    const infosInput = document.createElement('textarea');
    infosInput.classList.add('text-area');
    infosInput.setAttribute('placeholder', 'optional description about this project');

    projectSection.appendChild(titleInput);
    projectSection.appendChild(dateInput);
    projectSection.appendChild(infosInput);

    projectsContainer.appendChild(projectSection);

    // task section --------------------

    const tasksSection = document.createElement('section');
    tasksSection.setAttribute('id', 'tasks-section');
    tasksSection.setAttribute('data-count', '0');

    projectsContainer.appendChild(tasksSection);

    if (project) {
        project.tasks.forEach(task => {
            addATask('tasks-section', task.title, task.done);
        })
    }

    addATask('tasks-section');

    const addATaskButton = document.createElement('div'); // add a new task button
    addATaskButton.classList.add('add-a-task');
    addATaskButton.textContent = 'new task';
    addATaskButton.addEventListener('click', function () {
        addATask('tasks-section')
    });

    projectsContainer.appendChild(addATaskButton);

    if (project) { // create delete project button
        const deleteProjectButton = document.createElement('div');
        deleteProjectButton.classList.add('delete-project-button');
        deleteProjectButton.textContent = 'delete this project';
        deleteProjectButton.addEventListener('click', function () {
            deleteThisProject(project)
        });

        projectsContainer.appendChild(deleteProjectButton);

        titleInput.setAttribute('value', project.title);
        dateInput.setAttribute('value', dateFns.format(new Date(project.dueDate), 'YYYY-MM-DD'));
        infosInput.textContent = project.description;
    }

    saveOnLocalStorage();
}

//----------------------------------------------
// create a new project

function createProject() {
    const title = document.querySelector('.title-input').value;
    const description = document.querySelector('.text-area').value;
    const dueDate = document.querySelector('.date-input').value;

    const tasksSection = document.querySelector('#tasks-section');
    const tasksSectionChildren = tasksSection.childNodes;

    let tasks = [];
    tasksSectionChildren.forEach(child => {
        if (child.firstChild.value !== '') {
            let obj = {};
            obj.title = child.firstChild.value;
            obj.isDone = child.firstChild.dataset.done === 'true' ? true : false;
            tasks.push(obj);
        }
    });

    if (dueDate !== '' && title !== '' && tasks.length > 0) {
        let project = new Project(title, dueDate, undefined, description);
        tasks.forEach(task => {
            project.addTask(task.title, task.isDone);
        });

        controller.addProject(project);
        showProject(project);

    } else if (title === '' && dueDate === '') {
        alert('Please give a title and a due-date to your project');

    } else if (title === '') {
        alert('Please give a title to your project');

    } else if (dueDate === '') {
        alert('Please give a due-date to your project');

    } else if (tasks.length == 0) {
        alert('Please add at least one task to your project');
    }

    saveOnLocalStorage();
}

// ----------------------------------
// Update an existing project

function udpateProject(project) {
    controller.deleteProject(project.id);

    createProject();
}

// --------------------------------------
// delete existing project

function deleteThisProject(project) {
    controller.deleteProject(project.id);
    goHome();
}

//-----------------------------------------//
// remove a task when creating project

function removeTask(e) {
    const tasksSection = document.querySelector('#tasks-section');
    if (tasksSection.children.length > 1) {
        let theTaskDiv;

        if (e.target.classList.value.includes('fa-times-circle')) {
            theTaskDiv = e.target.parentNode.parentNode;
        } else theTaskDiv = e.target.parentNode;

        theTaskDiv.remove();
    }
}

// ---------------------------------
// add a task

function addATask(tasksContainer, value, done) {
    const tasksSection = document.getElementById(tasksContainer);
    let count = tasksSection.dataset.count;

    const taskDiv = document.createElement('div');
    taskDiv.setAttribute('data-id', `${count}`);
    taskDiv.classList.add('task-input');

    tasksSection.dataset.count = `${++count}`;

    const taskInput = document.createElement('input');
    taskInput.setAttribute('type', 'text');
    taskInput.setAttribute('placeholder', 'task');
    taskInput.setAttribute('data-done', `${done}`);

    if (value) taskInput.setAttribute('value', value);

    const removeTaskDiv = document.createElement('div');
    removeTaskDiv.classList.add('remove-task');
    removeTaskDiv.innerHTML = `<i class="fas fa-times-circle"></i>`;
    removeTaskDiv.addEventListener('click', removeTask);

    taskDiv.appendChild(taskInput);

    if (done) {
        const isDone = document.createElement('div');
        isDone.innerHTML = `<i class="far fa-check-circle"></i>`;
        isDone.classList.add('is-done');
        taskDiv.appendChild(isDone);
    }

    taskDiv.appendChild(removeTaskDiv);

    tasksSection.appendChild(taskDiv);
}

// -------------------- 
// local storage
function saveOnLocalStorage() {
    localStorage.setItem('controller', JSON.stringify(controller));
}

// ---------------------------------
// starting point for Testings

const today = new Date();
let controller;

if (JSON.parse(localStorage.getItem('controller'))) {
    let projectsList = JSON.parse(localStorage.getItem('controller')).projects;
    let projectsListTransformed = projectsList.map(project => {
        let theProject = new Project(project.title, project.dueDate, project.tasks, project.description);
        theProject.countId = project.countId;
        return theProject;
    });

    controller = new Controller();
    projectsListTransformed.forEach(project => controller.addProject(project));

} else {
    controller = new Controller();
}

if (!localStorage.getItem('controller')) {
    let projectOne = new Project('Trip to Mallorca', new Date(2019, 2, 2));
    projectOne.description = 'One week in Mallorca with Pia and her parents 😃';
    projectOneTasks = [
        'Prepare backpack',
        'get shortpants',
        'Prepare camera and charge batteries',
        'Passeport',
        'Be ready to have a blast'
    ];

    projectOneTasks.forEach(task => projectOne.addTask(task));
    controller.addProject(projectOne);

    let projectTwo = new Project('Create a Battleship Game', new Date(2019, 3, 7));
    projectTwo.description = 'Aim: develop a basic battleship game with drag and drop to place the boats. Make a decent AI too.';
    projectTwoTasks = [
        'Think before starting coding',
        'Create the board',
        'Create the player',
        'DOM interaction system',
        'and much more!!!!'
    ];
    projectTwoTasks.forEach(task => projectTwo.addTask(task));
    controller.addProject(projectTwo);
}

controller.sortProjects();
populateProjectsContainer(controller.projects);