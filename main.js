// ETA Download Professional - V2 Interaction Engine

const SUPABASE_URL = 'https://buvvzcgughfahhgufebm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1dnZ6Y2d1Z2hmYWhoZ3VmZWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0Mzc0MjYsImV4cCI6MjA4MjAxMzQyNn0.7VSHMGPGw-2kGsmLB2o15hduYNJNY-_dEudD0rCOA90';
let _supabase;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Supabase Init
    if (typeof supabase !== 'undefined') {
        _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        loadReviews();
    }

    // 2. Premium Navbar Reveal
    const header = document.getElementById('main-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 150) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 3. Smooth Orchestrator for Anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 4. Parallax Hover for Hero Mockup
    const mockup = document.querySelector('.mockup-wrapper');
    if (mockup) {
        document.addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
            mockup.style.transform = `perspective(1000px) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });

        document.addEventListener('mouseleave', () => {
            mockup.style.transform = `perspective(1000px) rotateY(-10deg) rotateX(5deg)`;
        });
    }

    // 5. Scroll Reveal Logic
    const revealElements = document.querySelectorAll('.showcase-row, .review-item, .submit-area');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });
});

async function loadReviews() {
    const list = document.getElementById('review-list');
    if (!list) return;

    list.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 4rem; color: var(--slate-400);">جاري تحميل قصص النجاح...</div>';

    try {
        const { data, error } = await _supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(20);
        if (error) throw error;

        if (!data || !data.length) {
            list.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 4rem; color: var(--brand);">كن أول من يترك بصمته هنا!</td></tr>';
        } else {
            list.innerHTML = data.map(r => `
                <tr>
                    <td style="font-weight: 800; color: var(--brand);">${escapeHtml(r.name)}</td>
                    <td style="color: #ffb800; font-size: 0.9rem;">${'★'.repeat(r.rating)}</td>
                    <td style="color: var(--slate-400); font-size: 0.95rem; line-height: 1.6;">"${escapeHtml(r.content)}"</td>
                </tr>
            `).join('');
        }
    } catch (err) {
        list.innerHTML = `<div style="grid-column: 1/-1; text-align:center; color: #ef4444;">عذراً، لم نتمكن من جلب المراجعات.</div>`;
    }
}

async function submitReview() {
    const name = document.getElementById('reviewer-name').value;
    const content = document.getElementById('review-content').value;
    const ratingElement = document.querySelector('input[name="rating"]:checked');
    const rating = ratingElement ? ratingElement.value : null;

    if (!name || !content || !rating) {
        alert('يرجى ملء كافة البيانات واختيار التقييم المناسب.');
        return;
    }

    const btn = event.currentTarget;
    btn.disabled = true;
    const originalContent = btn.innerHTML;
    btn.innerHTML = 'جاري المعالجة...';

    try {
        const { error } = await _supabase.from('reviews').insert([{ name, content, rating: parseInt(rating) }]);
        if (error) throw error;

        // Reset
        document.getElementById('reviewer-name').value = '';
        document.getElementById('review-content').value = '';
        if (ratingElement) ratingElement.checked = false;

        alert('تم استلام تقييمك بنجاح. شكراً لثقتك!');
        loadReviews();
    } catch (err) {
        alert('عذراً، حدث خطأ أثناء الإرسال.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalContent;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.submitReview = submitReview;
