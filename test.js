
// Self-invoking anonymous function untuk menjalankan kode secara otomatis
(function() {
    // Fungsi untuk melacak pengisian formulir di dalam iframe dan mengirimkan data ke dataLayer
    function leoMeasureIframeFormSubmitDataLayer() {
        // Selector untuk mencari iframe di dalam halaman
        var iframeSelector = 'iframe'; // Ganti sesuai dengan selector iframe Anda, misalnya 'iframe#id-of-iframe'

        // Memilih iframe dengan menggunakan selector yang telah ditentukan
        var iframe = document.querySelector(iframeSelector);
        var isFormSubmitted = false; // Menyimpan status apakah formulir sudah disubmit
        var isInsideIframe = false; // Menyimpan status apakah mouse berada di dalam area iframe
        var isCodeExecuted = false; // Menyimpan status apakah kode telah dieksekusi
        var iframeHeight; // Menyimpan ketinggian iframe


        // Observer untuk memantau perubahan di dalam iframe, terutama perubahan ketinggian
        var observer = new MutationObserver(function (_mutationsList, observer) {
            // Mendapatkan ketinggian saat ini dari iframe
            var currentHeight = iframe.offsetHeight;
            console.log("Iframe height now:"+currentHeight)
            // Menghitung persentase perubahan ketinggian iframe
            var iframeHeightChange = Math.abs(((currentHeight - iframeHeight) / iframeHeight) * 100);

            console.log("Iframe height submit:"+iframeHeightChange)
            // Jika perubahan ketinggian lebih dari 40% dan formulir belum disubmit, maka formulir telah disubmit
            if (!isFormSubmitted && iframeHeightChange > 40) {
                observer.disconnect(); // Menghentikan observer agar tidak terus memantau

                isFormSubmitted = true;
                // Mengirimkan data formulir ke dataLayer
                window.dataLayer = window.dataLayer || [];
                dataLayer.push({
                    event: 'iframe_form_submit',
                    form_location: window.location.href,
                    iframe_id: iframe.getAttribute('id'),
                    iframe_class: iframe.getAttribute('class')
                });
            }
        });

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
    leoMeasureIframeFormSubmitDataLayer();
})();
