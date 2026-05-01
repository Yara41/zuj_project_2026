{/* الرسائل */}
<div className="flex-1 overflow-y-auto p-4 md:p-10">
  <div className="max-w-4xl mx-auto space-y-6">

    {/* 🔥 جديد: إذا ما في رسائل */}
    {messages.length === 0 && (
      <div className="text-center space-y-8 mt-10">

        <div>
          <h2 className="text-3xl md:text-4xl font-black text-[#1e5631] mb-4">
            كيف يمكنني تسهيل رحلتك الأكاديمية اليوم؟
          </h2>
          <p className="text-slate-500 text-sm md:text-base">
            أنا هنا للإجابة على استفساراتك حول التسجيل، الخطط الدراسية، والأنظمة الجامعية بسرعة ودقة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">

          <button
            onClick={() => sendMessage("ما هو المسار الدراسي؟")}
            className="p-4 rounded-2xl border hover:bg-[#1e5631]/5 transition text-right"
          >
            <h3 className="font-bold text-[#1e5631]">المسار الدراسي</h3>
            <p className="text-xs text-slate-500">الخطة الدراسية لتخصصك</p>
          </button>

          <button
            onClick={() => sendMessage("ما هي الإجراءات الأكاديمية؟")}
            className="p-4 rounded-2xl border hover:bg-[#1e5631]/5 transition text-right"
          >
            <h3 className="font-bold text-[#1e5631]">الإجراءات الأكاديمية</h3>
            <p className="text-xs text-slate-500">شروط التسجيل والساعات</p>
          </button>

          <button
            onClick={() => sendMessage("كيف يتم الإرشاد الأكاديمي؟")}
            className="p-4 rounded-2xl border hover:bg-[#1e5631]/5 transition text-right"
          >
            <h3 className="font-bold text-[#1e5631]">الدعم الإرشادي</h3>
            <p className="text-xs text-slate-500">التواصل مع المرشد</p>
          </button>

          <button
            onClick={() => sendMessage("ما هي متطلبات التخرج؟")}
            className="p-4 rounded-2xl border hover:bg-[#1e5631]/5 transition text-right"
          >
            <h3 className="font-bold text-[#1e5631]">التخرج والتدريب</h3>
            <p className="text-xs text-slate-500">متطلبات المشروع</p>
          </button>

        </div>
      </div>
    )}

    {/* نفس كودك بدون تغيير */}
    {messages.map((msg, i) => (
      <div
        key={i}
        className={`flex ${
          msg.role === "user" ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`p-4 rounded-3xl ${
            msg.role === "user"
              ? "bg-[#1e5631] text-white"
              : "bg-white border"
          }`}
        >
          {msg.text}
        </div>
      </div>
    ))}

    {loading && <div>جاري المعالجة...</div>}

    <div ref={messagesEndRef} />
  </div>
</div>