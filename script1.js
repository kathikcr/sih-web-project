document.addEventListener('DOMContentLoaded', function() {
    // Sample course data
    const courses = [
        { 
            title: 'Machine learning', 
            image: 'mlimg.jpg', 
            description: 'Helps to analyse the water purity data and give us appropriate results',
            
        },
        { 
            title: 'chatbot', 
            image: 'chatbotimg.jpg', 
            description: 'Helps users solve common doubts they have about the standard water quality',
            
        },
        { 
            title: 'Climate Analysis integration', 
            image: 'climate.jpg', 
            description: 'Tells us about the climate conditions around the environment',
          
        }
    ];

    // Populate courses
    const courseGrid = document.querySelector('.course-grid');
    courses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.classList.add('course-card');
        courseCard.innerHTML = `
    <img src="${course.image}" alt="${course.title}">
    <div class="course-card-content">
        <h3>${course.title}</h3>
        <p>${course.description}</p>
    </div>
`;
        courseGrid.appendChild(courseCard);
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Form submission
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // Here you would typically send the form data to a server
        alert('Thank you for your message. We will get back to you soon!');
        contactForm.reset();
    });
});