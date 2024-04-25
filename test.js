

// Self-invoking anonymous function untuk menjalankan kode secara otomatis
(function() {
    // Fungsi untuk melacak pengisian formulir di dalam iframe dan mengirimkan data ke dataLayer
    function iframeFormSubmitDataLayer() {
        // Selector untuk mencari iframe di dalam halaman
        var iframeId= 'iframe-chat-wanda'; // Ganti sesuai dengan selector iframe Anda, misalnya 'iframe#id-of-iframe'

        // Memilih iframe dengan menggunakan selector yang telah ditentukan
        var iframe = document.getElementById(iframeId);
        var isFormSubmitted = false; // Menyimpan status apakah formulir sudah disubmit
        var isInsideIframe = false; // Menyimpan status apakah mouse berada di dalam area iframe
        var isCodeExecuted = false; // Menyimpan status apakah kode telah dieksekusi


         // Jika pengisian formulir disubmit, maka kirim data formulir ke dataLayer
        if (isFormSubmitted) {
    
        // Mengirimkan data formulir ke dataLayer
        window.dataLayer = window.dataLayer || [];
        dataLayer.push({
            event: 'iframe_form_submit',
            form_location: window.location.href,
            iframe_id: iframe.getAttribute('id'),
            iframe_class: iframe.getAttribute('class')
        });
    }


        // Fungsi untuk menangani event mouseover di dalam iframe
        function handleMouseOver(event) {
            // Memeriksa apakah mouse berada di dalam area iframe
            if (event.target.closest(iframeSelector)) {
                isInsideIframe = true;
            } else {
                isInsideIframe = false;
            }
        }

        // Fungsi untuk menangani pengisian formulir di dalam iframe
        function handleFormSubmission() {
            // Memilih formulir di dalam iframe
            var formInsideIframe = iframe.contentDocument.querySelector('form');

            // Menambahkan event listener untuk event submit formulir
            formInsideIframe.addEventListener('submit', function (event) {
                var formData = {}; // Objek untuk menyimpan data formulir
                var formInputs = formInsideIframe.querySelectorAll('input, select, textarea');

                // Mengambil nilai dari setiap input, select, dan textarea di dalam formulir
                for (var i = 0; i < formInputs.length; i++) {
                    var input = formInputs[i];
                    if (input.type === 'radio') {
                        if (input.checked) {
                            formData[input.name] = input.value;
                        }
                    } else if (input.type === 'checkbox') {
                        if (!formData[input.name]) {
                            formData[input.name] = [];
                        }
                        if (input.checked) {
                            formData[input.name].push(input.value);
                        }
                    } else {
                        formData[input.name] = input.value;
                    }
                }

                // Mengirimkan data formulir ke dataLayer
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    event: 'iframe_form_submit',
                    form_location: window.location.href,
                    iframe_id: iframe.getAttribute('id'),
                    iframe_class: iframe.getAttribute('class'),
                    user_inputs: formData
                });
            });
        }

        // Menambahkan event listener untuk event mouseover di dalam dokumen
        document.addEventListener('mouseover', handleMouseOver);

        // Menambahkan event listener untuk event blur di dalam window
        window.addEventListener('blur', function () {
            // Jika mouse berada di dalam area iframe dan kode belum dieksekusi
            if (isInsideIframe && !isCodeExecuted) {
                isCodeExecuted = true; // Mengubah status kode menjadi sudah dieksekusi
                document.removeEventListener('mouseover', handleMouseOver); // Menghapus event listener mouseover

                // Mengirimkan event 'iframe_form_start' ke dataLayer untuk menandai awal interaksi dengan formulir di dalam iframe
                window.dataLayer = window.dataLayer || [];
                dataLayer.push({
                    event: 'iframe_form_start',
                    form_location: window.location.href,
                    iframe_id: iframe.getAttribute('id'),
                    iframe_class: iframe.getAttribute('class')
                });

                // Jika konten di dalam iframe telah dimuat sepenuhnya
                if (iframe.contentDocument) {
                    handleFormSubmission(); // Menangani pengisian formulir di dalam iframe
                } else {
                    iframeHeight = iframe.offsetHeight; // Menyimpan ketinggian iframe saat ini
                    observer.observe(iframe, { attributes: true, childList: true, subtree: true }); // Memulai observer untuk memantau perubahan di dalam iframe
                }
            }
        });
    }

    // Memanggil fungsi untuk melacak pengisian formulir di dalam iframe
    iframeFormSubmitDataLayer();
})();

