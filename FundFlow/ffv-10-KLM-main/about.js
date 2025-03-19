// Rating and Donation System
class FundFlowSupport {
    constructor() {
        // Initialize DOM elements
        this.ratingModal = document.getElementById('ratingModal');
        this.donateModal = document.getElementById('donateModal');
        this.stars = document.querySelectorAll('.stars i');
        this.currentRating = 0;

        // Bind event listeners
        this.initializeEventListeners();
        this.initializeShareButton();
    }

    initializeEventListeners() {
        // Rating button click
        document.getElementById('rateBtn').addEventListener('click', () => this.openRatingModal());
        
        // Close modal button
        document.querySelector('.close-modal').addEventListener('click', () => this.closeRatingModal());
        
        // Stars interaction
        this.stars.forEach(star => {
            star.addEventListener('mouseover', () => this.handleStarHover(star));
            star.addEventListener('mouseout', () => this.handleStarOut());
            star.addEventListener('click', () => this.handleStarClick(star));
        });

        // Rating submission
        document.getElementById('submitRating').addEventListener('click', () => this.handleRatingSubmit());

        // Donation button click
        document.getElementById('donateBtn').addEventListener('click', () => this.openDonateModal());
        
        // Close buttons for both modals
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', (e) => this.closeModal(e));
        });

        // Preset amount buttons
        document.querySelectorAll('.amount-btn').forEach(button => {
            button.addEventListener('click', () => this.handlePresetAmount(button));
        });

        // Custom donation
        document.getElementById('customDonateBtn').addEventListener('click', () => this.handleCustomAmount());

        // Close modals when clicking outside
        window.addEventListener('click', (e) => this.handleOutsideClick(e));
    }

    openRatingModal() {
        this.ratingModal.style.display = 'block';
        setTimeout(() => this.ratingModal.classList.add('show'), 10);
    }

    closeRatingModal() {
        this.ratingModal.classList.remove('show');
        setTimeout(() => {
            this.ratingModal.style.display = 'none';
            this.resetRating();
        }, 300);
    }

    handleStarHover(star) {
        const rating = star.getAttribute('data-rating');
        this.highlightStars(rating);
        this.animateStars(rating);
    }

    handleStarOut() {
        this.highlightStars(this.currentRating);
        this.resetStarAnimations();
    }

    handleStarClick(star) {
        this.currentRating = star.getAttribute('data-rating');
        this.highlightStars(this.currentRating);
        this.pulseStars(this.currentRating);
    }

    highlightStars(rating) {
        this.stars.forEach(star => {
            const starRating = star.getAttribute('data-rating');
            star.classList.toggle('active', starRating <= rating);
        });
    }

    animateStars(rating) {
        this.stars.forEach((star, index) => {
            if (index < rating) {
                star.style.transform = 'scale(1.2)';
                star.style.transition = 'transform 0.2s ease';
            }
        });
    }

    resetStarAnimations() {
        this.stars.forEach(star => {
            star.style.transform = 'scale(1)';
        });
    }

    pulseStars(rating) {
        this.stars.forEach((star, index) => {
            if (index < rating) {
                star.style.animation = 'pulse 0.3s ease';
                setTimeout(() => {
                    star.style.animation = '';
                }, 300);
            }
        });
    }

    resetRating() {
        this.currentRating = 0;
        this.highlightStars(0);
        this.resetStarAnimations();
        document.getElementById('ratingFeedback').value = '';
    }

    handleRatingSubmit() {
        if (this.currentRating > 0) {
            const feedback = document.getElementById('ratingFeedback').value;
            // Here you would typically send the rating and feedback to your server
            this.showNotification(`Thank you for your ${this.currentRating}-star rating!`, "success");
            this.closeRatingModal();
        } else {
            this.showNotification("Please select a rating", "error");
        }
    }

    openDonateModal() {
        this.donateModal.style.display = 'block';
        setTimeout(() => this.donateModal.classList.add('show'), 10);
    }

    closeModal(e) {
        const modal = e.target.closest('.modal');
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    handlePresetAmount(button) {
        const amount = parseInt(button.dataset.amount);
        this.initializeRazorpay(amount);
    }

    handleCustomAmount() {
        const amount = document.getElementById('customAmount').value;
        if (amount && amount >= 1) {
            this.initializeRazorpay(parseInt(amount));
        } else {
            this.showNotification("Please enter a valid amount (minimum ₹1)", "error");
        }
    }

    initializeRazorpay(amount) {
        const options = {
            key: "rzp_test_a4zcZABGsJEBrs",
            amount: amount * 100,
            currency: "INR",
            name: "FundFlow",
            description: "Donation to FundFlow",
            image: "logo.png",
            handler: (response) => {
                this.showThankYouReceipt(response, amount);
                this.showNotification("Thank you for your donation!", "success");
                this.closeModal({ target: this.donateModal.querySelector('.close-modal') });
            },
            prefill: {
                name: "",
                email: "",
                contact: ""
            },
            theme: {
                color: "#4361ee"
            },
            modal: {
                ondismiss: () => {
                    this.showNotification("Payment cancelled", "error");
                }
            }
        };
        const rzp = new Razorpay(options);
        rzp.open();
    }

    handleOutsideClick(e) {
        if (e.target.classList.contains('modal')) {
            this.closeModal({ target: e.target.querySelector('.close-modal') });
        }
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    showThankYouReceipt(response, amount) {
        const modal = document.getElementById('thankYouModal');
        const transactionId = response.razorpay_payment_id;
        const currentDate = new Date().toLocaleString();
        
        // Update modal content
        document.getElementById('transactionId').textContent = transactionId;
        document.getElementById('donationAmount').textContent = `₹${amount}`;
        document.getElementById('donationDate').textContent = currentDate;
        
        // Store receipt data
        this.receiptData = {
            id: transactionId,
            amount: amount,
            date: currentDate
        };
        
        // Show modal
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);

        // Add download button listener
        const downloadBtn = modal.querySelector('.download-receipt');
        downloadBtn.addEventListener('click', () => {
            this.generateReceipt(this.receiptData);
            this.showNotification("Receipt downloaded successfully!", "success");
        });
    }

    initializeShareButton() {
        const shareBtn = document.getElementById('shareBtn');
        const shareModal = document.getElementById('shareModal');
        
        shareBtn.addEventListener('click', () => {
            shareModal.style.display = 'block';
            setTimeout(() => {
                shareModal.classList.add('show');
                this.animateShareStats();
            }, 10);
        });

        this.initializeShareOptions();
        this.initializeCopyLink();
    }

    initializeShareOptions() {
        const shareText = "🚀 Transform your financial journey with FundFlow! Track expenses, set budgets, and achieve your goals with ease. Join me in smart money management! 💰✨";
        const shareUrl = window.location.href;
        
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const platform = btn.dataset.platform;
                let url;
                
                switch(platform) {
                    case 'facebook':
                        url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${encodeURIComponent(shareText)}`;
                        break;
                    case 'twitter':
                        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${shareUrl}`;
                        break;
                    case 'whatsapp':
                        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
                        break;
                    case 'linkedin':
                        url = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}&summary=${encodeURIComponent(shareText)}`;
                        break;
                }
                
                // Add click animation
                const icon = btn.querySelector('i');
                icon.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    icon.style.transform = 'rotate(360deg)';
                }, 100);

                // Open share window
                const shareWindow = window.open(url, '_blank', 'width=600,height=600');
                
                // Show notification
                this.showNotification(`Sharing on ${platform.charAt(0).toUpperCase() + platform.slice(1)}...`, "success");
                
                // Check if share was successful
                const checkClosed = setInterval(() => {
                    if (shareWindow.closed) {
                        clearInterval(checkClosed);
                        this.updateShareStats();
                    }
                }, 1000);
            });
        });
    }

    initializeCopyLink() {
        const copyBtn = document.getElementById('copyLink');
        const shareLink = document.getElementById('shareLink');
        
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(shareLink.value).then(() => {
                copyBtn.classList.add('copied');
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                
                this.showNotification("Link copied to clipboard!", "success");
                
                setTimeout(() => {
                    copyBtn.classList.remove('copied');
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Link';
                }, 2000);
            });
        });
    }

    animateShareStats() {
        const stats = document.querySelectorAll('.stat-number');
        stats.forEach(stat => {
            const value = stat.textContent;
            stat.textContent = '0';
            let current = 0;
            const target = parseFloat(value);
            const increment = target / 50;
            const duration = 1500;
            const stepTime = duration / 50;

            const updateValue = () => {
                current += increment;
                if (current <= target) {
                    stat.textContent = current.toFixed(1).replace('.0', '');
                    setTimeout(updateValue, stepTime);
                } else {
                    stat.textContent = value;
                }
            };

            updateValue();
        });
    }

    updateShareStats() {
        const shareCount = document.querySelector('.stat-number');
        const currentCount = parseInt(shareCount.textContent);
        shareCount.textContent = (currentCount + 1).toString();
    }

    generateReceipt(transactionData) {
        // Create new jsPDF instance
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add FundFlow logo and header
        doc.setFontSize(24);
        doc.setTextColor(67, 97, 238);
        doc.text('FundFlow', 105, 20, { align: 'center' });
        
        // Add receipt title
        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.text('Donation Receipt', 105, 35, { align: 'center' });

        // Add separator line
        doc.setLineWidth(0.5);
        doc.line(20, 40, 190, 40);

        // Add receipt details
        doc.setFontSize(12);
        doc.setTextColor(60);

        const startY = 60;
        const lineHeight = 10;

        // Receipt content
        const details = [
            ['Transaction ID:', transactionData.id],
            ['Amount:', `₹${transactionData.amount}`],
            ['Date:', transactionData.date],
            ['Status:', 'Successful'],
            ['Payment Method:', 'Razorpay']
        ];

        details.forEach((detail, index) => {
            doc.text(40, startY + (index * lineHeight), detail[0]);
            doc.text(100, startY + (index * lineHeight), detail[1]);
        });

        // Add thank you message
        doc.setFontSize(14);
        doc.setTextColor(67, 97, 238);
        doc.text('Thank you for your support!', 105, 120, { align: 'center' });

        // Add footer
        doc.setFontSize(10);
        doc.setTextColor(128);
        doc.text('FundFlow - Smart Expense Tracking', 105, 270, { align: 'center' });
        doc.text('IT PARK SAHASTRADHARA ROAD, DEHRADUN', 105, 275, { align: 'center' });
        doc.text('Contact: support@fundflow.com', 105, 280, { align: 'center' });

        // Generate timestamp for filename
        const timestamp = new Date().getTime();
        
        // Save the PDF
        doc.save(`FundFlow_Receipt_${timestamp}.pdf`);
    }
}

// Initialize the support system when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FundFlowSupport();
}); 