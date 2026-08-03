const toggleButtons = document.querySelectorAll("[id^='toggle']");

toggleButtons.forEach(button => {

    button.addEventListener("click", () => {

        const input = button.previousElementSibling;

        if(input.type === "password"){

            input.type = "text";

            button.innerHTML =
            '<i class="fa-solid fa-eye-slash"></i>';

        }

        else{

            input.type = "password";

            button.innerHTML =
            '<i class="fa-solid fa-eye"></i>';

        }

    });

});