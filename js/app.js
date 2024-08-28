document.addEventListener('DOMContentLoaded', () => {
    const bookmarkForm = document.getElementById('bookmarkForm');
    const categoriesContainer = document.getElementById('categoriesContainer');
    const bookmarkModal = document.getElementById('bookmarkModal');
    const openModalButton = document.getElementById('openModal');
    const closeModalButton = document.getElementById('closeModal');
    const cancelButton = document.getElementById('cancelButton');
    const fileError = document.getElementById('fileError');
    const saveButton = document.getElementById('saveButton');
    const modalTitle = document.getElementById('modalTitle');
    const bookmarkIconInput = document.getElementById('bookmarkIcon');
    const bookmarkCategorySelect = document.getElementById('bookmarkCategory');
    const fileInputLabel = document.querySelector('label[for="bookmarkIcon"]');
    const openSidebarButton = document.getElementById('openSidebar');
    const closeSidebarButton = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('sidebar');
    const themeToggle = document.getElementById('themeToggle');
    const notifyButton = document.getElementById('notifyButton');
    const notifyUpdatesButton = document.getElementById('notifyUpdates');
    const deleteModal = document.getElementById('deleteModal');
    const confirmDeleteButton = document.getElementById('confirmDelete');
    const cancelDeleteButton = document.getElementById('cancelDelete');
    const deleteModalTitle = document.getElementById('deleteModalTitle');
    const deleteModalLink = document.getElementById('deleteModalLink');
    let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    let editingIndex = null;
    let deletingIndex = null;

    // Function to display the bookmarks
    const displayBookmarks = () => {
        categoriesContainer.innerHTML = '';

        if (bookmarks.length === 0) {
            document.getElementById('noLinksState').classList.remove('hidden');
            return;
        }
        document.getElementById('noLinksState').classList.add('hidden');

        const categories = Array.from(new Set(bookmarks.map(b => b.category)));

        categories.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.classList.add('mb-8');

            const categoryTitle = document.createElement('h2');
            categoryTitle.classList.add('text-xl', 'font-bold', 'text-purple-500', 'mb-4');
            categoryTitle.textContent = category;

            const bookmarkGrid = document.createElement('div');
            bookmarkGrid.classList.add('grid', 'grid-cols-2', 'sm:grid-cols-4', 'md:grid-cols-6', 'lg:grid-cols-8', 'gap-4');

            const filteredBookmarks = bookmarks.filter(b => b.category === category);

            filteredBookmarks.forEach((bookmark, index) => {
                const bookmarkCard = document.createElement('div');
                bookmarkCard.classList.add('bookmark-card', 'bg-white', 'rounded-lg', 'shadow-lg', 'overflow-hidden', 'relative');

                const bookmarkImage = document.createElement('img');
                bookmarkImage.classList.add('bookmark-image', 'h-24', 'w-full', 'object-cover');
                bookmarkImage.src = bookmark.icon || 'https://via.placeholder.com/100';

                const bookmarkTitle = document.createElement('div');
                bookmarkTitle.classList.add('p-2', 'truncate');
                bookmarkTitle.textContent = bookmark.name;

                const actionIcons = document.createElement('div');
                actionIcons.classList.add('action-icons', 'absolute', 'top-2', 'right-2', 'flex', 'space-x-2', 'opacity-0', 'transition-opacity', 'duration-300', 'bg-white', 'p-1', 'rounded-lg');

                const redirectButton = document.createElement('button');
                redirectButton.innerHTML = '<i class="fas fa-external-link-alt text-gray-500"></i>';
                redirectButton.onclick = () => openBookmark(index);

                const editButton = document.createElement('button');
                editButton.innerHTML = '<i class="fas fa-edit text-gray-500"></i>';
                editButton.onclick = () => editBookmark(index);

                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-trash-alt text-gray-500"></i>';
                deleteButton.onclick = () => {
                    deletingIndex = index;
                    deleteModalTitle.textContent = `Delete Link: ${bookmark.name}`;
                    deleteModalLink.textContent = `URL: ${bookmark.url}`;
                    deleteModal.classList.remove('hidden');
                };

                actionIcons.appendChild(redirectButton);
                actionIcons.appendChild(editButton);
                actionIcons.appendChild(deleteButton);

                bookmarkCard.appendChild(bookmarkImage);
                bookmarkCard.appendChild(bookmarkTitle);
                bookmarkCard.appendChild(actionIcons);

                bookmarkCard.addEventListener('mouseenter', () => {
                    actionIcons.classList.remove('opacity-0');
                });

                bookmarkCard.addEventListener('mouseleave', () => {
                    actionIcons.classList.add('opacity-0');
                });

                bookmarkGrid.appendChild(bookmarkCard);
            });

            categoryDiv.appendChild(categoryTitle);
            categoryDiv.appendChild(bookmarkGrid);
            categoriesContainer.appendChild(categoryDiv);
        });
    };

    // Open a bookmark in a new tab and increment its open count
    const openBookmark = (index) => {
        try {
            bookmarks[index].opens++;
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
            window.open(bookmarks[index].url, '_blank');
            displayBookmarks();
        } catch (error) {
            console.error("Error opening bookmark:", error);
        }
    };

    // Populate the modal with existing bookmark data for editing
    const editBookmark = (index) => {
        try {
            editingIndex = index;
            modalTitle.textContent = 'Edit Link';
            saveButton.textContent = 'Update Link';
            document.getElementById('bookmarkName').value = bookmarks[index].name;
            document.getElementById('bookmarkUrl').value = bookmarks[index].url;
            bookmarkCategorySelect.value = bookmarks[index].category;
            bookmarkIconInput.value = ''; // Reset file input

            // Update file input label based on whether an icon exists
            fileInputLabel.textContent = bookmarks[index].icon ? 'Replace File' : 'Upload New File';

            bookmarkModal.classList.remove('hidden');
        } catch (error) {
            console.error("Error editing bookmark:", error);
        }
    };

    // Delete a bookmark
    const deleteBookmark = () => {
        try {
            if (deletingIndex !== null) {
                bookmarks.splice(deletingIndex, 1);
                localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
                displayBookmarks();
                deletingIndex = null;
            }
            deleteModal.classList.add('hidden');
        } catch (error) {
            console.error("Error deleting bookmark:", error);
        }
    };

    // Handle the form submission for adding or editing a bookmark
    bookmarkForm.addEventListener('submit', (e) => {
        e.preventDefault();

        try {
            const name = document.getElementById('bookmarkName').value;
            const url = document.getElementById('bookmarkUrl').value;
            const category = bookmarkCategorySelect.value;
            const file = bookmarkIconInput.files[0];
            let valid = true;

            // Validate file size
            if (file && file.size > 1048576) {
                fileError.classList.remove('hidden');
                valid = false;
            } else {
                fileError.classList.add('hidden');
            }

            if (valid) {
                const reader = new FileReader();

                reader.onload = function (event) {
                    const icon = file ? event.target.result : bookmarks[editingIndex]?.icon || '';

                    if (editingIndex !== null) {
                        // Update existing bookmark
                        bookmarks[editingIndex].name = name;
                        bookmarks[editingIndex].url = url;
                        bookmarks[editingIndex].category = category;
                        bookmarks[editingIndex].icon = icon;
                        editingIndex = null;
                    } else {
                        // Add new bookmark
                        bookmarks.push({ name, url, category, icon, opens: 0 });
                    }

                    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
                    bookmarkForm.reset();
                    fileInputLabel.textContent = 'Upload New File'; // Reset label
                    bookmarkModal.classList.add('hidden');
                    displayBookmarks();
                };

                if (file) {
                    reader.readAsDataURL(file);
                } else {
                    // If no file selected, process without reading the file
                    if (editingIndex !== null) {
                        bookmarks[editingIndex].name = name;
                        bookmarks[editingIndex].url = url;
                        bookmarks[editingIndex].category = category;
                        editingIndex = null;
                    } else {
                        bookmarks.push({ name, url, category, icon: '', opens: 0 });
                    }

                    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
                    bookmarkForm.reset();
                    fileInputLabel.textContent = 'Upload New File'; // Reset label
                    bookmarkModal.classList.add('hidden');
                    displayBookmarks();
                }
            }
        } catch (error) {
            console.error("Error saving bookmark:", error);
        }
    });

    // Open the modal for adding a new bookmark
    openModalButton.addEventListener('click', () => {
        try {
            editingIndex = null;
            modalTitle.textContent = 'Add Links';
            saveButton.textContent = 'Save Link';
            bookmarkForm.reset();
            bookmarkCategorySelect.value = 'Work'; // Default category
            bookmarkIconInput.value = ''; // Reset file input
            fileInputLabel.textContent = 'Upload New File'; // Reset label
            bookmarkModal.classList.remove('hidden');
        } catch (error) {
            console.error("Error opening add bookmark modal:", error);
        }
    });

    // Close the bookmark modal
    closeModalButton.addEventListener('click', () => {
        try {
            bookmarkModal.classList.add('hidden');
        } catch (error) {
            console.error("Error closing modal:", error);
        }
    });

    // Cancel and close the bookmark modal
    cancelButton.addEventListener('click', () => {
        try {
            bookmarkModal.classList.add('hidden');
        } catch (error) {
            console.error("Error canceling modal:", error);
        }
    });

    // Open and close the sidebar
    openSidebarButton.addEventListener('click', () => {
        try {
            sidebar.classList.remove('translate-x-full');
        } catch (error) {
            console.error("Error opening sidebar:", error);
        }
    });

    closeSidebarButton.addEventListener('click', () => {
        try {
            sidebar.classList.add('translate-x-full');
        } catch (error) {
            console.error("Error closing sidebar:", error);
        }
    });

    // Toggle between light and dark mode
    themeToggle.addEventListener('change', () => {
        try {
            document.body.classList.toggle('dark', themeToggle.checked);
        } catch (error) {
            console.error("Error toggling theme:", error);
        }
    });

    // Redirect to the notify update page
    notifyButton.addEventListener('click', () => {
        try {
            window.location.href = 'releaseupdate.html';
        } catch (error) {
            console.error("Error redirecting to notify update page:", error);
        }
    });

    // Redirect to the notify update page from the sidebar
    notifyUpdatesButton.addEventListener('click', () => {
        try {
            window.location.href = 'releaseupdate.html';
        } catch (error) {
            console.error("Error redirecting to notify update page from sidebar:", error);
        }
    });

    // Handle delete confirmation
    confirmDeleteButton.addEventListener('click', deleteBookmark);

    // Cancel delete action
    cancelDeleteButton.addEventListener('click', () => {
        try {
            deleteModal.classList.add('hidden');
        } catch (error) {
            console.error("Error canceling delete:", error);
        }
    });

    // Initial call to display bookmarks on page load
    try {
        displayBookmarks();
    } catch (error) {
        console.error("Error displaying bookmarks:", error);
    }
});
