# Generated manually for BlogPost save and title fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog_app', '0003_ollamasettings'),
    ]

    operations = [
        migrations.AddField(
            model_name='blogpost',
            name='is_saved',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='blogpost',
            name='title',
            field=models.CharField(blank=True, max_length=500),
        ),
    ]

